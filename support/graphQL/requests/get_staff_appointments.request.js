const fetch = require('node-fetch')
const myHeaders = new fetch.Headers()
const { staff } = require('../queries/staff.query')

/*
 * This function not added to the Cypress custom commands as is used in
 * the cypress.config.js file which does not allow Cypress commands.
 * Returns clients from an API call and saves them in a fixture file
 * This means that we always use live data and makes tests more robust
 */
async function getStaffAppointments (file, userID, token, date) {
  const config = require(`../../config/${file}.json`)
  const graphQLUrl = config.env.graphQLUrl
  const businessID = config.env.businessID
  const branchID = config.env.branchID

  myHeaders.append('x-memento-security-context', businessID + '|' + branchID + '|' + userID)
  myHeaders.append('Authorization', `Bearer ${token}`)
  myHeaders.append('Content-Type', 'application/json')

  const graphql = JSON.stringify({
    query: staff.staffCalendar,
    variables: {
      mode: 'WORKING_STAFF',
      startDate: date,
      endDate: date
    }
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
  }

  return await fetch(graphQLUrl, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('3. Server response wasn\'t OK')
      }
    })
    .then((json) => {
      myHeaders.delete('x-memento-security-context')
      myHeaders.delete('Authorization')
      myHeaders.delete('Content-Type')

      return json.data.staffCalendar
    })
}
module.exports = { getStaffAppointments }
