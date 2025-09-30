import { path } from 'static-path'

const providersPath = path('/providers')
const projectsPath = path('/projects')
const referenceDataPath = path('/references')

export default {
  providers: {
    teams: providersPath.path(':providerId/teams'),
  },
  projects: {
    sessions: projectsPath.path('allocations'),
    sessionAppointments: projectsPath.path(':projectId').path('appointments'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    enforcementActions: referenceDataPath.path('enforce-ment-actions'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
  },
}
