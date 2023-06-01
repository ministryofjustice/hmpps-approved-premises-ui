import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'

export default (assessment: Assessment): boolean => {
  if (assessment.status === 'awaiting_response' && assessment.data) {
    const response = assessment.data?.['sufficient-information']?.['information-received']?.informationReceived
    return response === 'no'
  }
  return false
}
