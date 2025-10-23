const client = {
  createClient: `mutation CreateClient($input: CreateClientInput!) {
  createClient(input: $input) {
    client {
      ...clientFields
      __typename
    }
    __typename
  }
}

fragment clientFields on Client {
  id
  address {
    city
    country {
      code
      __typename
    }
    postalCode
    state
    streetAddress1
    streetAddress2
    __typename
  }
  appointmentReminderEmailOptout
  appointmentReminderSmsOptout
  archived
  avatar {
    medium
    __typename
  }
  clientCategories {
    id
    description
    name
    __typename
  }
  clientSince
  clientSource {
    id
    name
    __typename
  }
  creditAccount {
    id
    outstandingBalance
    __typename
  }
  creditTerms {
    creditDays
    creditLimit
    __typename
  }
  dateOfBirth
  email
  externalId
  firstName
  gender
  isBanned
  isWalkIn
  landLine
  lastName
  linkedClient {
    id
    mobile
    name
    __typename
  }
  marketingEmailOptout
  marketingSmsOptout
  mobile
  name
  noShowCount
  notes
  preferredStaff {
    id
    avatar {
      medium
      __typename
    }
    firstName
    lastName
    name
    __typename
  }
  preferredStaffId
  rawMobile
  referringClient {
    id
    avatar {
      medium
      __typename
    }
    name
    __typename
  }
  shouldPromptAppointmentNotes
  shouldPromptClientNotes
  treatCard {
    matrixDisabled
    serial
    __typename
  }
  treatCardAccount {
    id
    points
    __typename
  }
  completed
  __typename
}`,
  forgetClient: `mutation ForgetClient($clientId: ID!) {
  forgetClient(clientId: $clientId)
}`,
};
module.exports = { client };
