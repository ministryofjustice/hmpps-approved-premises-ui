import { UserQualification, ApprovedPremisesApplication as Application } from '@approved-premises/api'

export const getQualificationsForApplication = (application: Application): Array<UserQualification> => {
  const qualifications: Array<UserQualification> = []

  if (application.isPipeApplication) {
    qualifications.push('pipe')
  }

  if (application.isWomensApplication) {
    qualifications.push('womens')
  }

  return qualifications
}
