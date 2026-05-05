import { Cas1SpaceBooking, CaseDetail } from '@approved-premises/api'
import { TaskData } from '@approved-premises/ui'
import PersonService from '../../services/personService'
import ApplicationService from '../../services/applicationService'
import AssessmentService from '../../services/assessmentService'
import { ApiOutcome } from '../utils'
import { FormDataService } from '../../services'

export type TabControllerParameters = {
  personService?: PersonService
  applicationService?: ApplicationService
  assessmentService?: AssessmentService
  formDataService?: FormDataService
  crn?: string
  token?: string
  caseDetail?: CaseDetail
  caseDetailOutcome?: ApiOutcome
  placement?: Cas1SpaceBooking
  profileData?: TaskData
}
