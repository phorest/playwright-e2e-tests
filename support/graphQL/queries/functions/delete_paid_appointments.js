const axios = require('axios')
const xml2js = require('xml2js')

function trimPurchaseID (id) {
  const res = id.replace('urn:x-memento:Purchase:', '')
  return res
}

function get (url, username, password) {
  const config = {
    method: 'GET',
    url,
    auth: {
      username,
      password
    }
  }
  const res = axios(config)
  return res
}

function deletePurchase (url, id, username, password) {
  const config = {
    method: 'delete',
    url: url + id,
    auth: {
      username,
      password
    }
  }
  const res = axios(config)
  return res
}

function yesterday (date = new Date()) {
  date.setDate(date.getDate() - 1)
  return date
}

function addWeeks (weeks, date = new Date()) {
  date.setDate(date.getDate() + weeks * 7)
  return date
}
const startDate = yesterday(new Date(new Date().setUTCHours(0, 0, 0, 0))).toISOString()
const endDate = addWeeks(2, new Date(new Date().setUTCHours(0, 0, 0, 0))).toISOString()

async function deletePaidAppointments (file) {
  const config = require(`../../config/${file}.json`)
  const apiUrl = config.env.apiUrl
  const businessID = config.env.businessID
  const branchID = config.env.branchID
  const username = process.env.apiUsername
  const password = process.env.apiPassword

  const getPaidAppointmentsURL = `${apiUrl}/memento/rest/business/${businessID}/branch/${branchID}/purchase?date=>=${startDate}&date=<=${endDate}`

  const deletePaidAppointmentURL = `${apiUrl}/memento/rest/business/${businessID}/branch/${branchID}/purchase/`

  await get(getPaidAppointmentsURL, username, password)
    .then((response) => {
      xml2js.parseString(response.data, { trim: true }, async function (error, result) {
        if (!error) {
          if (result.purchaseList.$.totalResults === '0') {
            console.log(startDate + ' to ' + endDate + ' -> ' + 'No paid appointments to delete!')
          } else {
            const purchases = result.purchaseList.purchase.length
            
            for (let i = 0; i < purchases; i++) {
              const id = trimPurchaseID(result.purchaseList.purchase[i].identity[0].$.id)
              if (result.purchaseList.purchase[i].voidReason === null){
                  console.log('Deleting purchase ID: ' + id)
                  await deletePurchase(deletePaidAppointmentURL, id, username, password)
                    .then((response) => {
                })
                console.log(startDate + ' to ' + endDate + ' -> ' + purchases + ' paid appointments to delete!')
              }
            }
          }
        }
      })
    }).catch(function (error) {
      console.log(error)
    })
}

module.exports = { deletePaidAppointments }