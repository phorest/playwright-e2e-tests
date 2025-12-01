const purchases = {
  getPurchases: `query Purchases($first: Int, $after: String, $filterBy: PurchasesFilterBy!) {
        purchases(first: $first, after: $after, filterBy: $filterBy) {
          edges {
            node {
              ...purchaseFields
              __typename
            }
            __typename
          }
          pageInfo {
            endCursor
            hasNextPage
            __typename
          }
          totalCount
          purchasesTotalAmount
          __typename
        }
      }
      
      fragment purchaseFields on Purchase {
        id
        changeAmount {
          amount
          currency
          __typename
        }
        clientId
        clientName
        client {
          id
          mobile
          email
          __typename
        }
        complimentarySaleType
        isFullRefund
        isPartialRefund
        items {
          description
          discountAmount {
            amount
            currency
            __typename
          }
          purchaseItemType
          quantity
          staffMember {
            id
            name
            avatar {
              medium
              __typename
            }
            __typename
          }
          staffName
          totalAmount {
            amount
            currency
            __typename
          }
          voucherSerial
          purchaseItemType
          __typename
        }
        loggedInStaffName
        payments {
          id
          amount
          cardTransactions {
            account
            authCode
            cardMerchantAccount {
              name
              __typename
            }
            cardType
            tipAmount
            totalAmount
            transactionId
            paymentsPaymentMethodType
            __typename
          }
          code
          name
          type
          __typename
        }
        purchasedAtDateTime
        staffAbbreviation
        totalAmount
        totalTipAmount {
          amount
          currency
          __typename
        }
        totalSurchargeAmount {
          amount
          currency
          __typename
        }
        transactionNumber
        voidReason
        voidedPurchase {
          purchasedAtDateTime
          __typename
        }
        voidingPurchase {
          purchasedAtDateTime
          __typename
        }
        zeroPurchaseType
        __typename
      }`,
    };
module.exports = { purchases };