import { path } from 'static-path'

const providersPath = path('/providers')

export default {
  providers: {
    teams: providersPath.path(':providerId/teams'),
  },
}
