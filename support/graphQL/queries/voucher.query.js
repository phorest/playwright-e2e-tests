const voucher = {
  createVoucher: `mutation CreateVoucher($input: CreateVoucherInput!) {
  createVoucher(input: $input) {
    voucher {
      ...voucherFields
      __typename
    }
    __typename
  }
}

fragment voucherFields on Voucher {
  id
  archived
  issueDate
  expiryDate
  expired
  serial
  recipientEmail
  remainingBalance {
    ...moneyFields
    __typename
  }
  originalBalance {
    ...moneyFields
    __typename
  }
  client {
    id
    name
    __typename
  }
  creatingBranch {
    shortName
    __typename
  }
  notes
  __typename
}

fragment moneyFields on Money {
  amount
  currency
  __typename
}`,
};
module.exports = { voucher };
