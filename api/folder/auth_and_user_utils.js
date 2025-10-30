/**
 * API utilities for authentication and user management
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getActiveEnv } from '../../config/runtime.js';
import { Staff } from '../../models/Staff.js';
import { User } from '../../models/User.js';

// Environment getters - exact copy from Python
function BUSINESS_ID() {
    return getActiveEnv().businessId;
}

function BRANCH_ID() {
    return getActiveEnv().branchId;
}

function GRAPHQL_URL() {
    return `${getActiveEnv().apiGateway}/api-facade/graphql`;
}

function REST_URL(path) {
    return `${getActiveEnv().apiGateway}${path}`;
}

function ORIGIN() {
    return getActiveEnv().appOrigin;
}


let __ENV_BANNER_SHOWN = false;
function _debugEnvOnce() {
    if (!__ENV_BANNER_SHOWN) {
        const env = getActiveEnv();
        console.log(
            `[ENV] name=${env.name} | ` +
            `base_url=${env.baseUrl} | ` +
            `api_gateway=${env.apiGateway} | ` +
            `origin=${ORIGIN()} | ` +
            `business_id=${BUSINESS_ID()} | branch_id=${BRANCH_ID()}`
        );
        __ENV_BANNER_SHOWN = true;
    }
}

function _headersJson(token, instanceId = "tests", includeOrigin = true) {
    const h = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-memento-security-context": `${BUSINESS_ID()}|${BRANCH_ID()}|`,
        "x-phorest-application-id": "my-phorest",
        "x-phorest-application-instance-id": instanceId,
        "apollographql-client-name": "my-phorest",
    };
    if (includeOrigin) {
        h["Origin"] = ORIGIN();
        h["Referer"] = `${ORIGIN()}/`;
    }
    return h;
}

function _headersOrigin(token, contentType, accept = null) {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": contentType,
        "Accept": accept || contentType,
        "Origin": ORIGIN(),
        "Referer": `${ORIGIN()}/`,
    };
}

/**
 * Get access token from localStorage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {string} Access token
 */
export async function getAccessTokenFromLocalStorage(page) {
    _debugEnvOnce();
    const token = await page.evaluate(() => localStorage.getItem('access-token'));
    if (!token) {
        throw new Error("No access token found in localStorage");
    }
    console.log(`[DEBUG] Access token extracted from localStorage: ${token.substring(0, 60)}...`);
    return token;
}

/**
 * Create staff user via REST API
 * @param {string} token - Access token
 * @returns {Staff} Staff object
 */
export async function createStaffUserRest(token) {
    _debugEnvOnce();

    const uniqueFirst = uuidv4().substring(0, 6);
    const uniqueLast = uuidv4().substring(0, 6);
    const firstName = `Test${uniqueFirst}`;
    const lastName = `User${uniqueLast}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@phorest.com`;

    const headers = _headersOrigin(token, "application/vnd.memento.Staff+json");

    const payload = {
        "@type": "Staff",
        "archived": false,
        "details": {
            "user": {
                "@type": "User",
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "archived": false,
            },
            "hideFromOnlineBookings": false
        }
    };
    console.log(`email ${email}`);

    const url = REST_URL(`/memento/rest/business/${BUSINESS_ID()}/branch/${BRANCH_ID()}/staff`);
    console.log(`[DEBUG] POST ${url}`);

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(`[DEBUG] status=${response.status}`);
        console.log(`[DEBUG] body:\n${JSON.stringify(response.data, null, 2)}`);

        const data = response.data;

        // Extract user ID
        const userIdentityUrn = data?.details?.user?.identity?.id;
        let userId = null;

        if (userIdentityUrn && userIdentityUrn.includes(':')) {
            userId = userIdentityUrn.split(':').pop();
        }

        if (!userId) {
            const userLinks = data?.details?.user?.links || [];
            const selfHref = userLinks.find(link => link.rel === 'self')?.href;
            if (selfHref) {
                const match = selfHref.match(/\/user\/([^/]+)/);
                if (match) {
                    userId = match[1];
                }
            }
        }

        if (!userId) {
            throw new Error("Could not extract user id (suffix) from response");
        }

        // Extract staff ID
        const links = data.links || [];
        const selfLink = links.find(link => link.rel === 'self')?.href;
        if (!selfLink) {
            throw new Error("Could not find staff self link in response");
        }

        const staffMatch = selfLink.match(/\/staff\/([^/]+)/);
        if (!staffMatch) {
            throw new Error("Could not extract staff ID from self URL");
        }
        const staffResourceId = staffMatch[1];

        const fullName = `${firstName} ${lastName}`;

        console.log(`[DEBUG] Created staff ${fullName}`);
        console.log(`[DEBUG] → USER ID (suffix): ${userId}`);
        console.log(`[DEBUG] → STAFF ID: ${staffResourceId}`);

        const staff = new Staff(fullName, userId);
        staff.idForStaffDelete = staffResourceId;
        return staff;
    } catch (error) {
        const safeBody = error.response?.data ? JSON.stringify(error.response.data).substring(0, 2000) : "<empty>";
        console.log(`[ERROR] staff create failed: ${error.response?.status} ${error.response?.statusText}`);
        console.log(`[ERROR] response body (truncated): ${safeBody}`);
        console.log(`[ERROR] payload sent: ${JSON.stringify(payload, null, 2)}`);
        throw error;
    }
}

/**
 * Set staff work schedule
 * @param {string} token - Access token
 * @param {string} staffId - Staff ID
 */
export async function setStaffWorkSchedule(token, staffId) {
    _debugEnvOnce();

    const headers = {
        ..._headersOrigin(token, "application/vnd.memento.WorkActivity+json"),
        "Content-Type": "application/vnd.memento.WorkActivity+json",
        "Accept": "application/vnd.memento.WorkActivity+json, application/vnd.memento.Message+json",
    };

    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday

    const payload = {
        "@type": "WorkActivity",
        "activityDate": monday.toISOString().split('T')[0],
        "startTime": "00:00:00.000",
        "endTime": "23:30:00.000",
        "overridesAllOlder": false,
        "recurrence": {
            "recurrenceRule": {
                "frequency": "WEEKLY",
                "interval": 1,
                "weekDayList": [
                    { value: "MO", offset: 0 },
                    { value: "TU", offset: 0 },
                    { value: "WE", offset: 0 },
                    { value: "TH", offset: 0 },
                    { value: "FR", offset: 0 },
                    { value: "SA", offset: 0 },
                    { value: "SU", offset: 0 }
                ],
            }
        },
        "type": "WORKING",
        "branchRef": `urn:x-memento:Branch:${BRANCH_ID()}`,
        "workActivityRanges": [],
    };

    const postUrl = REST_URL(`/memento/rest/business/${BUSINESS_ID()}/user/${staffId}/workActivity`);

    console.log(`[DEBUG] POST ${postUrl}`);
    console.log(`[DEBUG] Payload:\n${JSON.stringify(payload, null, 2)}`);

    try {
        const response = await axios.post(postUrl, payload, { headers, timeout: 15000 });
        console.log(`[DEBUG] POST -> ${response.status}`);
        console.log(`[DEBUG] Trace-ID: ${response.headers['x-phorest-trace-id']}`);
        console.log(`[DEBUG] Location: ${response.headers.location}`);
    } catch (error) {
        console.log(`[DEBUG] POST -> ${error.response?.status}`);
        console.log(`[DEBUG] Trace-ID: ${error.response?.headers?.['X-Phorest-Trace-Id']}`);
        console.log(`[DEBUG] Location: ${error.response?.headers?.Location}`);
        throw error;
    }
}

/**
 * Archive staff
 * @param {string} token - Access token
 * @param {string} staffId - Staff ID
 */
export async function archiveStaff(token, staffId) {
    _debugEnvOnce();
    const url = REST_URL(
        `/memento/rest/business/${BUSINESS_ID()}/branch/${BRANCH_ID()}/staff/archive?ignore_warnings=true`
    );
    const headers = _headersOrigin(token, "application/vnd.memento.ArchiveRequest+json");
    const payload = {
        "includesRefs": [`urn:x-memento:Staff:${staffId}`],
        "@type": "ArchiveRequest",
        "defaultArchivePolicy": "ARCHIVE_NONE",
        "unarchive": false,
    };

    console.log(`[DEBUG] POST ${url}`);
    console.log(`[DEBUG] Payload:\n${JSON.stringify(payload, null, 2)}`);

    try {
        const response = await axios.post(url, payload, { headers });
        const traceId = response.headers["x-phorest-trace-id"] || "N/A";

        console.log(`[DEBUG] Status: ${response.status}`);
        console.log(`[DEBUG] Trace-ID: ${traceId}`);
        console.log(`[DEBUG] Response:\n${JSON.stringify(response.data, null, 2)}`);

        if (response.status === 412 && JSON.stringify(response.data).includes("STAFF_FUTURE_APPOINTMENTS")) {
            console.log(`[WARN] Staff ${staffId} has future appointments — ignoring and marking archived.`);
            return;
        }

        console.log(`[DEBUG] Archived staff ${staffId}`);
    } catch (error) {
        console.log(`[DEBUG] Status: ${error.response?.status}`);
        console.log(`[DEBUG] Trace-ID: ${error.response?.headers?.["x-phorest-trace-id"] || "N/A"}`);
        console.log(`[DEBUG] Response:\n${JSON.stringify(error.response?.data, null, 2)}`);
        throw error;
    }
}

/**
 * Get appointment ID by staff name
 * @param {string} staffName - Staff name
 * @param {string} token - Access token
 * @returns {string|null} Appointment ID or null
 */
export async function getAppointmentIdByStaffName(staffName, token) {
    _debugEnvOnce();
    const todayStr = new Date().toISOString().split('T')[0];
    const headers = _headersJson(token, uuidv4());
    const payload = {
        "operationName": "CalendarStaff",
        "variables": { "mode": "ALL_STAFF", "startDate": todayStr, "endDate": todayStr },
        "query": `
      query CalendarStaff($startDate: LocalDate!, $endDate: LocalDate!, $mode: StaffCalendarMode!) {
        staffCalendar(startDate: $startDate, endDate: $endDate, options: {mode: $mode}) {
          name
          calendarDays { events { __typename ... on Appointment { id } } }
        }
      }`
    };
    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (CalendarStaff)`);

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status >= 400) {
            console.log("🚨 GraphQL error", response.status);
            console.log(response.data);
            throw new Error(`GraphQL error: ${response.status}`);
        }

        const data = response.data;
        for (const staff of data.data.staffCalendar) {
            if (staff.name === staffName) {
                for (const day of staff.calendarDays || []) {
                    for (const event of day.events || []) {
                        if (event.__typename === "Appointment") {
                            return event.id;
                        }
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error(`[ERROR] Failed to get appointment ID: ${error.message}`);
        throw error;
    }
}

/**
 * Delete appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} token - Access token
 * @returns {boolean} Success status
 */
export async function deleteAppointment(appointmentId, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, uuidv4());
    const payload = {
        "operationName": "DeleteAppointments",
        "variables": { "ids": [appointmentId], "deleteAllRecurringAppointments": false },
        "query": `
      mutation DeleteAppointments($ids: [ID!]!, $deleteAllRecurringAppointments: Boolean) {
        deleteAppointments(
          input: {appointmentIds: $ids, deleteAllRecurringAppointments: $deleteAllRecurringAppointments}
        ) { appointments { id __typename } __typename }
      }`
    };
    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (DeleteAppointments)`);

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 200) {
            console.log(` Appointment ${appointmentId} deleted via GraphQL.`);
            return true;
        }
        console.log(`❌ Failed to delete ${appointmentId}. Status: ${response.status}`);
        console.log(response.data);
        return false;
    } catch (error) {
        console.error(`[ERROR] Failed to delete appointment: ${error.message}`);
        return false;
    }
}

/**
 * Freeze client membership by user
 * @param {string} user.name - User email
 * @param {string} token - Access token
 */
export async function freezeClientMembershipByUser(user, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, 'freeze-client-membership-script');

    console.log(`[INFO] Searching for membership of user: ${user.name}`);

    let cursor = null;
    let membershipId = null;

    while (true) {
        const queryPayload = {
            operationName: 'ClientMemberships',
            variables: { after: cursor },
            query: `
        query ClientMemberships($after: String) {
          clientMemberships(first: 50, after: $after) {
            edges { node { id status client { id name email } } }
            pageInfo { hasNextPage endCursor }
          }
        }`
        };

        const url = GRAPHQL_URL();
        console.log(`[DEBUG] POST ${url} (ClientMemberships)`);

        try {
            const response = await axios.post(url, queryPayload, { headers });
            console.log(`[DEBUG] GraphQL page fetch status: ${response.status}`);

            const data = response.data;
            const edges = data.data?.clientMemberships?.edges || [];
            const pageInfo = data.data?.clientMemberships?.pageInfo || {};

            for (const edge of edges) {
                const m = edge.node;
                console.log(`[DEBUG] Checking membership for client: ${m.client.name} (looking for: ${user.name})`);
                if (m.client.name === user.name) {
                    membershipId = m.id;
                    console.log(`[DEBUG] Found membership ID: ${membershipId}`);
                    break;
                }
            }

            if (membershipId || !pageInfo.hasNextPage) {
                break;
            }
            cursor = pageInfo.endCursor;
        } catch (error) {
            console.error(`[ERROR] Failed to fetch memberships: ${error.message}`);
            throw error;
        }
    }

    if (!membershipId) {
        throw new Error(`[ERROR] No membership found for user: ${user.name}`);
    }

    console.log(`[DEBUG] Proceeding to freeze membership ID: ${membershipId}`);

    // Freeze membership
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const freezePayload = {
        operationName: 'UpdateClientMembership',
        variables: {
            clientMembershipId: membershipId,
            input: {
                chosenBillingDate: today,
                status: 'FROZEN',
                frozenReason: null,
                notes: null,
            },
        },
        query: `
      mutation UpdateClientMembership($clientMembershipId: ID!, $input: UpdateClientMembershipInput!) {
        updateClientMembership(clientMembershipId: $clientMembershipId, input: $input) {
          clientMembership { id status }
        }
      }`
    };

    const url = GRAPHQL_URL();
    console.log(`[DEBUG] URL: ${url}`);
    console.log(`[DEBUG] POST ${url} (UpdateClientMembership → FROZEN)`);
    console.log(`[DEBUG] Freeze payload:`, JSON.stringify(freezePayload, null, 2));

    try {
        const freezeResponse = await axios.post(url, freezePayload, { headers });
        console.log(`[DEBUG] Freeze response status: ${freezeResponse.status}`);
        console.log(`[DEBUG] Freeze response data:`, JSON.stringify(freezeResponse.data, null, 2));
        console.log(`[INFO] Frozen membership ${membershipId} for user ${user.name}`);
        return freezeResponse.data;
    } catch (error) {
        console.error(`[ERROR] Failed to freeze membership: ${error.message}`);
        if (error.response) {
            console.error(`[ERROR] Response status: ${error.response.status}`);
            console.error(`[ERROR] Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Unfreeze client membership by user
 * @param {string} user.name - User email
 * @param {string} token - Access token
 */
export async function unfreezeClientMembershipByUser(user, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, 'unfreeze-client-membership-script');

    console.log(`[INFO] Unfreezing membership for user: ${user.name}`);

    // Find membership ID
    let membershipId = null;
    let afterCursor = null;

    while (true) {
        const queryPayload = {
            operationName: 'ClientMemberships',
            variables: { after: afterCursor },
            query: `
        query ClientMemberships($after: String) {
          clientMemberships(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges { node { id status client { id name email } } }
          }
        }`
        };

        const url = GRAPHQL_URL();
        console.log(`[DEBUG] POST ${url} (ClientMemberships page)`);

        try {
            const response = await axios.post(url, queryPayload, { headers });
            const data = response.data;
            const membershipsData = data.data.clientMemberships;

            for (const edge of membershipsData.edges) {
                const node = edge.node;
                if (node.client.name === user.name) {
                    membershipId = node.id;
                    break;
                }
            }

            if (membershipId || !membershipsData.pageInfo.hasNextPage) {
                break;
            }
            afterCursor = membershipsData.pageInfo.endCursor;
        } catch (error) {
            console.error(`[ERROR] Failed to fetch memberships: ${error.message}`);
            throw error;
        }
    }

    if (!membershipId) {
        throw new Error(`[ERROR] No membership found for user: ${user.name}`);
    }

    console.log(`[DEBUG] Found membership ID: ${membershipId}`);
    console.log(`[DEBUG] Proceeding to unfreeze membership ID: ${membershipId}`);

    // Unfreeze membership
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const unfreezePayload = {
        operationName: 'UpdateClientMembership',
        variables: {
            clientMembershipId: membershipId,
            input: {
                chosenBillingDate: today,
                status: 'ACTIVE',
                frozenReason: null,
                notes: null,
            },
        },
        query: `
      mutation UpdateClientMembership($clientMembershipId: ID!, $input: UpdateClientMembershipInput!) {
        updateClientMembership(clientMembershipId: $clientMembershipId, input: $input) {
          clientMembership { id status }
        }
      }`
    };

    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (UpdateClientMembership → ACTIVE)`);

    try {
        const unfreezeResponse = await axios.post(url, unfreezePayload, { headers });
        console.log(`[DEBUG] Unfreeze response status: ${unfreezeResponse.status}`);
        const status = unfreezeResponse.data.data.updateClientMembership.clientMembership.status;
        console.log(`[SUCCESS] Membership ${membershipId} for user '${user.name}' un-frozen. Status: ${status}`);
        return unfreezeResponse.data;
    } catch (error) {
        console.error(`[ERROR] Failed to unfreeze membership: ${error.message}`);
        throw error;
    }
}

/**
 * Cancel client membership by user
 * @param {string} user.name - User email
 * @param {string} token - Access token
 */
export async function cancelClientMembershipByUser(user, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, 'cancel-client-membership-script');

    console.log(`[INFO] Searching memberships to cancel for user: ${user.name}`);

    // Find membership ID
    let membershipId = null;
    let afterCursor = null;

    while (true) {
        const queryPayload = {
            operationName: 'ClientMemberships',
            variables: { after: afterCursor },
            query: `
        query ClientMemberships($after: String) {
          clientMemberships(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges { node { id status client { id name email } } }
          }
        }`
        };

        const url = GRAPHQL_URL();
        console.log(`[DEBUG] POST ${url} (ClientMemberships page)`);

        try {
            const response = await axios.post(url, queryPayload, { headers });
            const data = response.data;
            const membershipsData = data.data.clientMemberships;

            for (const edge of membershipsData.edges) {
                const node = edge.node;
                if (node.client.name === user.name) {
                    membershipId = node.id;
                    break;
                }
            }

            if (membershipId || !membershipsData.pageInfo.hasNextPage) {
                break;
            }
            afterCursor = membershipsData.pageInfo.endCursor;
        } catch (error) {
            console.error(`[ERROR] Failed to fetch memberships: ${error.message}`);
            throw error;
        }
    }

    if (!membershipId) {
        throw new Error(`[ERROR] No membership found for user: ${user.name}`);
    }

    console.log(`[DEBUG] Found membership ID: ${membershipId}`);

    // Cancel membership
    const cancelPayload = {
        operationName: 'CancelMembership',
        variables: { id: membershipId, cancel: true },
        query: `
      mutation CancelMembership($id: ID!, $cancel: Boolean!) {
        cancelMembership(id: $id, cancel: $cancel)
      }`
    };

    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (CancelMembership)`);

    try {
        const cancelResponse = await axios.post(url, cancelPayload, { headers });
        console.log(`[DEBUG] Cancel response status: ${cancelResponse.status}`);
        if (cancelResponse.status !== 200) {
            throw new Error(`Unexpected status: ${cancelResponse.status}`);
        }
        console.log(`[INFO] Cancelled membership ${membershipId} for user ${user.name}`);
        return cancelResponse.data;
    } catch (error) {
        console.error(`[ERROR] Failed to cancel membership: ${error.message}`);
        if (error.response) {
            console.error(`[ERROR] Response status: ${error.response.status}`);
            console.error(`[ERROR] Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get course ID by name
 * @param {string} courseName - Course name
 * @param {string} token - Access token
 * @returns {Promise<string>} Course ID
 */
export async function getCourseIdByName(courseName, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, `instance-id-${Date.now()}`);
    const payload = {
        operationName: 'Courses',
        variables: { first: 100, after: 'MA==', filterBy: {} },
        query: `
      query Courses($first: Int, $after: String, $filterBy: CourseFilterBy) {
        courses(first: $first, after: $after, filterBy: $filterBy) {
          edges { node { id name } }
        }
      }`
    };

    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (Courses)`);

    const response = await axios.post(url, payload, { headers });
    const data = response.data;

    for (const edge of data.data.courses.edges) {
        const node = edge.node;
        if (node.name === courseName) {
            console.log(`[INFO] Found course '${courseName}' with ID: ${node.id}`);
            return node.id;
        }
    }

    throw new Error(`Course '${courseName}' not found`);
}

/**
 * Archive course by ID
 * @param {string} courseId - Course ID
 * @param {string} token - Access token
 * @returns {Promise<number>} Status code
 */
export async function archiveCourseById(courseId, token) {
    _debugEnvOnce();
    const headers = _headersJson(token, `instance-id-${Date.now()}`);
    const payload = {
        operationName: 'BulkArchiveCourses',
        variables: {
            bulkRequest: { selectionMode: 'SELECT_NONE', selectedIds: [courseId], unselectedIds: [] },
            archive: true,
            filterBy: {}
        },
        query: `
      mutation BulkArchiveCourses($bulkRequest: BulkRequestInput!, $filterBy: CourseFilterBy!, $archive: Boolean!) {
        bulkArchiveCourses(bulkRequest: $bulkRequest, filterBy: $filterBy, archive: $archive) {
          count __typename
        }
      }`
    };

    const url = GRAPHQL_URL();
    console.log(`[DEBUG] POST ${url} (BulkArchiveCourses)`);

    const response = await axios.post(url, payload, { headers });
    if (response.status === 200) {
        console.log(`[INFO] Archived course ID: ${courseId}`);
        return response.status;
    }

    throw new Error(`Failed to archive course: ${response.status}`);
}
