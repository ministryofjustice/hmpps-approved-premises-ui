import { path } from 'static-path'

const sessionsPath = path('/sessions')
const appointmentsPath = path('/appointments')

const paths = {
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
    show: sessionsPath.path(':id'),
  },
  appointments: {
    update: appointmentsPath.path(':appointmentId').path('/update'),
  },
}

export default paths
