import { Cas1SpaceBooking, PersonRisks } from '@approved-premises/api'
import PersonService from '../../services/personService'
import ApplicationService from '../../services/applicationService'
import AssessmentService from '../../services/assessmentService'

export type TabControllerParameters = {
  personService?: PersonService
  applicationService?: ApplicationService
  assessmentService?: AssessmentService
  crn?: string
  token?: string
  personRisks?: PersonRisks
  placement?: Cas1SpaceBooking
}
