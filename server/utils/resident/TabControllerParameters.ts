import { ApprovedPremisesApplication, Cas1SpaceBooking, PersonRisks } from '@approved-premises/api'
import PersonService from '../../services/personService'

export type TabControllerParameters = {
  personService?: PersonService
  applicationService?: { findApplication(token: string, id: string): Promise<ApprovedPremisesApplication> }
  crn?: string
  token?: string
  personRisks?: PersonRisks
  placement?: Cas1SpaceBooking
}
