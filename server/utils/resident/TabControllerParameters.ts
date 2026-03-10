import { Cas1SpaceBooking, CaseDetail } from '@approved-premises/api'
import PersonService from '../../services/personService'
import ApplicationService from '../../services/applicationService'
import AssessmentService from '../../services/assessmentService'
import { ApiOutcome } from '../utils'

export type TabControllerParameters = {
  personService?: PersonService
  applicationService?: ApplicationService
  assessmentService?: AssessmentService
  crn?: string
  token?: string
  caseDetail?: CaseDetail
  caseDetailOutcome?: ApiOutcome
  placement?: Cas1SpaceBooking
}
