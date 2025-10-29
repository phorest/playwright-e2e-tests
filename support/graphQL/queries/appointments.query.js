const appointments = {
  createAppointment: `mutation CreateAppointment(
    $date: LocalDate!
    $selectedTime: LocalTime!
    $serviceId: ID!
    $staffMemberId: ID
    $clientId: ID
    $issues: [String!]
  ) {
    createAppointment(
      createAppointmentInput: {
        date: $date
        selectedTime: $selectedTime
        serviceId: $serviceId
        staffId: $staffMemberId
        clientId: $clientId
      }
      acceptedIssues: $issues
    ) {
      appointment {
        ...appointmentFields
        staffMember: staff {
          ...staffMemberFields
          __typename
        }
        __typename
      }
      issues {
        issueType
        date
        __typename
      }
      __typename
    }
  }
  
  fragment appointmentFields on Appointment {
    id
    date
    startTime
    endTime
    durationMins
    price {
      amount
      currency
      __typename
    }
    depositPaid {
      amount
      currency
      __typename
    }
    machineId
    roomId
    staffMemberId
    flags
    staffRequested
    confirmed
    state
    service {
      id
      name
      color {
        hex
        __typename
      }
      durationMins
      gapTimeMins
      price {
        amount
        currency
        __typename
      }
      __typename
    }
    client {
      id
      name
      mobile
      email
      __typename
    }
    recurrence {
      __typename
      ... on WeeklyRecurrence {
        id
        interval
        weekDays
        start
        end
        __typename
      }
      ... on MonthlyDateRecurrence {
        id
        interval
        monthDays
        start
        end
        __typename
      }
      ... on MonthlyWeekDayRecurrence {
        id
        interval
        weekDay
        ordinal
        start
        end
        __typename
      }
    }
    __typename
  }
  
  fragment staffMemberFields on Staff {
    id
    name
    firstName
    lastName
    color {
      hex
      __typename
    }
    avatar {
      medium
      __typename
    }
    __typename
  }`,

  deleteAppointment: `mutation DeleteAppointments(
    $ids: [ID!]!
    $deleteAllRecurringAppointments: Boolean
  ) {
    deleteAppointments(
      input: {
        appointmentIds: $ids
        deleteAllRecurringAppointments: $deleteAllRecurringAppointments
      }
    ) {
      appointments {
        id
        __typename
      }
      __typename
    }
  }`,

  appointmentDetails: `query CalendarStaff($startDate: LocalDate!, $endDate: LocalDate!, $staffId: ID) {
  staffCalendar(startDate: $startDate, endDate: $endDate, staffId: $staffId) {
    id
    name
    firstName
    lastName
    color {
      hex
      __typename
    }
    avatar {
      medium
      __typename
    }
    categoryId
    calendarDays {
      date
      timeSlots(type: WORKING) {
        date
        startTime
        endTime
        __typename
      }
      events {
        __typename
        ... on Appointment {
          ...appointmentFields
          __typename
        }
        ... on Break {
          ...breakFields
          __typename
        }
      }
      __typename
    }
    __typename
  }
}

fragment appointmentFields on Appointment {
  id
  date
  startTime
  endTime
  durationMins
  price {
    amount
    currency
    __typename
  }
  machineId
  roomId
  staffMemberId
  flags
  staffRequested
  confirmed
  state
  service {
    id
    name
    color {
      hex
      __typename
    }
    durationMins
    gapTimeMins
    price {
      amount
      currency
      __typename
    }
    __typename
  }
  client {
    id
    name
    mobile
    __typename
  }
  __typename
}

fragment breakFields on Break {
  date
  durationMins
  endDateTime
  endTime
  id
  label
  machineId
  paidBreak
  roomId
  staffMemberId
  startDateTime
  startTime
  __typename
}`
}
module.exports = { appointments }
