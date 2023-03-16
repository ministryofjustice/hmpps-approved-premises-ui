import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

export const decisionFromAssessment = (assessment: Assessment) =>
  assessment?.data?.['make-a-decision']?.['make-a-decision']?.decision || ''

export const applicationAccepted = (assessment: Assessment) => {
  switch (decisionFromAssessment(assessment)) {
    case 'releaseDate':
      return true
    case 'hold':
      return true
    default:
      return false
  }
}
