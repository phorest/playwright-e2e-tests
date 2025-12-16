const { getToken } = require('../requests/get_token.request')
const { getUserID } = require('../requests/get_user_id.request')
const { getStaffAppointments } = require('../requests/get_staff_appointments.request')
const { deleteBreak } = require('../requests/delete_break.request')

const moment = require('moment')

async function deleteBreaks (file) {
  const token = await getToken(file)

  const userID = await getUserID(file, token)

  for (let i = 0; i < 14; i++) {
    const date = moment().add(i - 1, 'day').format('YYYY-MM-DD')

    await getStaffAppointments(file, userID, token, date).then(async (allStaff) => {
      const appointmentList = allStaff.filter(item => item.calendarDays[0].events.length > 0)
        .flatMap(item => item.calendarDays[0].events)

      const filterOutAppointmentsFromEvents = appointmentList.filter(item => item.__typename !== 'Appointment')

      const breaksIDs = []

      for (let i = 0; i < filterOutAppointmentsFromEvents.length; i++) {
        breaksIDs.push(filterOutAppointmentsFromEvents[i].id)
      }

      console.log(date + ' -> ' + breaksIDs.length + ' breaks to delete!')

      for (let i = 0; i < breaksIDs.length; i++) {
        await deleteBreak(file, token, userID, breaksIDs[i])
      }
    })
  }
}

module.exports = { deleteBreaks }