import { path } from 'static-path'

const appointmentsPath = path('/appointments')
const providersPath = path('/providers')
const projectsPath = path('/projects')
const referenceDataPath = path('/references')

export default {
  appointments: {
    singleAppointment: appointmentsPath.path(':appointmentId'),
  },
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
