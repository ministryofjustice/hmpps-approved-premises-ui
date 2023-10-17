import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '../../@types/shared'
import isAssessment from './isAssessment'

export default (applicationOrAssessment: Assessment | Application): boolean => {
  if (!isAssessment(applicationOrAssessment)) return false

  if (applicationOrAssessment.status === 'awaiting_response' && applicationOrAssessment.data) {
    const response =
      applicationOrAssessment.data?.['sufficient-information']?.['information-received']?.informationReceived
    return response === 'no'
  }
  return false
}
