import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { SessionDataError } from '../errors'

export const convictedOffenceResponseFromApplication = (application: Application): string => {
  try {
    return application.data['risk-management-features']['convicted-offences'].response
  } catch (e) {
    throw new SessionDataError('No convicted offences response found')
  }
}
