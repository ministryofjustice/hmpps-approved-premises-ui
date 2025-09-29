import { path } from 'static-path'

const sessionsPath = path('/sessions')

const paths = {
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
  },
}

export default paths
