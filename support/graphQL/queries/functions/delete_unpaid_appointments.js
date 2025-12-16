const { getToken } = require('../requests/get_token.request')
const { getUserID } = require('../requests/get_user_id.request')
const { getStaffAppointments } = require('../requests/get_staff_appointments.request')
const { deleteAppointment } = require('../requests/delete_appointment.request')

const moment = require('moment')

async function deleteUnpaidAppointments (file) {
  const token = await getToken(file)

  const userID = await getUserID(file, token)

  for (let i = 0; i < 14; i++) {
    const date = moment().add(i - 1, 'day').format('YYYY-MM-DD')

    await getStaffAppointments(file, userID, token, date).then(async (allStaff) => {
      const appointmentList = allStaff.filter(item => item.calendarDays[0].events.length > 0)
        .flatMap(item => item.calendarDays[0].events)

      const filterOutBreaksFromEvents = appointmentList.filter(item => item.__typename !== 'Break')

      const filterEvents = filterOutBreaksFromEvents.filter(item => item.state !== 'PAID')

      const appointmentIDs = []

      for (let i = 0; i < filterEvents.length; i++) {
        const t = filterEvents[i].id
        appointmentIDs.push(t)
      }

      console.log(date + ' -> ' + appointmentIDs.length + ' unpaid appointments to delete!')

      for (let i = 0; i < appointmentIDs.length; i++) {
        await deleteAppointment(file, token, userID, appointmentIDs[i])
      }
    })
  }
}

module.exports = { deleteUnpaidAppointments }