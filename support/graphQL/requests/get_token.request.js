const fetch = require('node-fetch')
const myHeaders = new fetch.Headers()

/*
 * This function not added to the Cypress custom commands as is used in
 * the cypress.config.js file which does not allow Cypress commands.
 * Creates a token using tokenURL and staff member's email/password
 * The token can then be used tp perform API calls
 */
async function getToken (file) {
  const config = require(`../../config/${file}.json`)
  const tokenUrl = config.env.tokenUrl
  const email = config.env.staff[0].email
  const staffPassword = process.env.staffPassword

  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    grant_type: 'basic',
    client_type: 'user',
    username: email,
    password: staffPassword
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  }

  return await fetch(tokenUrl, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('Server response wasn\'t OK')
      }
    })
    .then((json) => {
      myHeaders.delete('Content-Type')

      return json.access_token
    })
}

module.exports = { getToken }
