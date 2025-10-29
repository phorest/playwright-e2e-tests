const { appointments } = require('../queries/appointments.query')

const fetch = require('node-fetch')
const myHeaders = new fetch.Headers()

async function deleteAppointment (file, token, userID, appointmentId) {
  const config = require(`../../config/${file}.json`)
  const graphQLUrl = config.env.graphQLUrl
  const businessID = config.env.businessID
  const branchID = config.env.branchID

  myHeaders.append('x-memento-security-context', businessID + '|' + branchID + '|' + userID)
  myHeaders.append('Authorization', `Bearer ${token}`)
  myHeaders.append('Content-Type', 'application/json')

  const graphql = JSON.stringify({
    query: appointments.deleteAppointment,
    variables: {
      ids: [appointmentId],
      deleteAllRecurringAppointments: false
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
        throw new Error('Server response wasn\'t OK')
      }
    })
    .then((json) => {
      myHeaders.delete('x-memento-security-context')
      myHeaders.delete('Authorization')
      myHeaders.delete('Content-Type')

      return console.log(json.data)
    })
}
module.exports = { deleteAppointment }
