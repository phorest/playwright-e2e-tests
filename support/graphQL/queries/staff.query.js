const staff = {
  staffCount: `query Staff($first: Int, $after: String, $filterBy: StaffFilterBy) {
        staffConnection(first: $first, after: $after, filterBy: $filterBy) {
          edges {
            node {
              id
              name
              firstName
              lastName
              color {
                hex
              }
              avatar {
                medium
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
          totalCount
        }
      }`,
  staffCalendar: `query CalendarStaff($startDate: LocalDate!, $endDate: LocalDate!, $mode: StaffCalendarMode!, $departmentId: ID, $hasDepartment: Boolean, $staffId: ID, $staffIds: [ID!]) {
  staffCalendar(
    startDate: $startDate
    endDate: $endDate
    options: {staffId: $staffId, staffIds: $staffIds, mode: $mode, departmentId: $departmentId, hasDepartment: $hasDepartment}
  ) {
    id
    name
    firstName
    lastName
    userId
    color {
      hex
      __typename
    }
    avatar {
      medium
      __typename
    }
    categoryId
    calendarPosition
    calendarDays {
      date
      timeSlots {
        date
        startTime
        endTime
        tag
        type
        __typename
      }
      events {
        __typename
        ... on Appointment {
          ...appointmentCalendarFields
          __typename
        }
        ... on Break {
          ...breakFields
          __typename
        }
      }
      __typename
    }
    __typename
  }
}

fragment appointmentCalendarFields on Appointment {
  id
  client {
    ...calendarClientFields
    __typename
  }
  clientCourse {
    id
    name
    __typename
  }
  clientCourseItem {
    id
    initialUnits
    unitsRemaining
    __typename
  }
  color {
    hex
    __typename
  }
  confirmed
  date
  depositAmountMonetary {
    amount
    currency
    __typename
  }
  depositPaidMonetary {
    amount
    currency
    __typename
  }
  durationMins
  endTime
  flags
  groupBookingId
  groupBookingPrimaryClientId
  hasMicroDeposit
  isReward
  machine {
    id
    name
    __typename
  }
  min24HourDepositPaidMonetary {
    amount
    currency
    __typename
  }
  priceMonetary {
    amount
    currency
    __typename
  }
  room {
    id
    name
    __typename
  }
  service {
    ...serviceCalendarFields
    __typename
  }
  serviceGroup {
    id
    name
    isSpecialOffer
    __typename
  }
  serviceGroupId
  serviceGroupItemOptionId
  staffMemberId
  staffRequested
  startTime
  state
  __typename
}

fragment calendarClientFields on Client {
  id
  email
  firstName
  isBanned
  mobile
  name
  shouldPromptAppointmentNotes
  shouldPromptClientNotes
  __typename
}

fragment serviceCalendarFields on Service {
  id
  durationMins
  gapTimeMins
  name
  patchTestRequired
  __typename
}

fragment breakFields on Break {
  date
  durationMins
  endDateTime
  endTime
  id
  label
  machine {
    id
    __typename
  }
  paidBreak
  room {
    id
    __typename
  }
  staffMemberId
  startDateTime
  startTime
  isRecurrent
  __typename
}`
}
module.exports = { staff }
