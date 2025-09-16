import { path } from 'static-path'

const sessionsPath = path('/sessions')

const paths = {
  sessions: {
    show: sessionsPath,
    search: sessionsPath.path('search'),
  },
}

export default paths
