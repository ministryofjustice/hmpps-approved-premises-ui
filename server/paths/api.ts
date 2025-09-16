import { path } from 'static-path'

const providersPath = path('/providers')
const projectsPath = path('/projects')

export default {
  providers: {
    teams: providersPath.path(':providerId/teams'),
  },
  projects: {
    sessions: projectsPath.path('allocations'),
  },
}
