const user = {
  getUser: `query User {
        user {
          firstName
          lastName
          email
          id
        }
      }`,

  getUserById: `query UserById($id: ID!) {
    user: userById(id: $id) {
      ...userFields
      __typename
    }
  }
  
  fragment userFields on User {
    id
    email
    business {
      id
      name
      domainName
      locale {
        countryCode
        lang
        __typename
      }
      marketing {
        onlineReputationEnabled
        __typename
      }
      staffMembersSettings {
        breakPaidByDefault
        __typename
      }
      isSingleBranch
      isMultiBranch
      showRebookingPromptBeforePurchase
      __typename
    }
    staff {
      id
      name
      firstName
      lastName
      avatar {
        medium
        __typename
      }
      branch {
        id
        accountId
        fullName
        phone
        shortName
        domainName
        timezone
        advancedCashUp
        onlineBookingEnabled
        workingWeek {
          day
          hours {
            start
            __typename
          }
          __typename
        }
        weekStartDay
        locale {
          countryCode
          lang
          __typename
        }
        marketing {
          reconnectFollowUpAfterDays
          reconnectFollowUpEnabled
          reconnectFollowUpTime
          reconnectMessageChannel
          __typename
        }
        address {
          htmlFormattedAddress
          __typename
        }
        payment {
          creditCardProvider
          creditCardIntegrationEnabled
          __typename
        }
        __typename
      }
      accessLevel {
        frontendPermissions
        __typename
      }
      __typename
    }
    __typename
  }`
}
module.exports = { user }
