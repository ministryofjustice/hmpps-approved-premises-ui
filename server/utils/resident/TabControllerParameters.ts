import { Cas1SpaceBooking, PersonRisks } from '@approved-premises/api'
import PersonService from '../../services/personService'
import ApplicationService from '../../services/applicationService'

export type TabControllerParameters = {
  personService?: PersonService
  applicationService?: ApplicationService
  crn?: string
  token?: string
  personRisks?: PersonRisks
  placement?: Cas1SpaceBooking
}
