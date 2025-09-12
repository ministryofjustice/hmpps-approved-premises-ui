import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, providerClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
  }
}

export type Services = ReturnType<typeof services>
