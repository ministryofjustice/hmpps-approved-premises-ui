import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'
import SessionService from './sessionService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, providerClient, sessionClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
    sessionService: new SessionService(sessionClient),
  }
}

export type Services = ReturnType<typeof services>
