import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'
import SessionService from './sessionService'
import ReferenceDataService from './referenceDataService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, providerClient, sessionClient, referenceDataClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
    sessionService: new SessionService(sessionClient),
    referenceDataService: new ReferenceDataService(referenceDataClient),
  }
}

export type Services = ReturnType<typeof services>
