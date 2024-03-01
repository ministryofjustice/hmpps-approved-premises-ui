import {
  ApprovedPremisesApplication as Application,
  Cas1ApplicationUserDetails as UserDetails,
} from '../../@types/shared'
import ConfirmYourDetails from '../../form-pages/apply/reasons-for-placement/basic-information/confirmYourDetails'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { userDetailsFromCaseManagerPage, userDetailsFromConfirmYourDetailsPage } from './userDetailsFromApplication'

export const applicantAndCaseManagerDetails = (
  application: Application,
): {
  applicantUserDetails: UserDetails
  caseManagerUserDetails: UserDetails
  caseManagerIsNotApplicant: boolean
} => {
  const applicantUserDetails = userDetailsFromConfirmYourDetailsPage(application)
  const caseManagerUserDetails = userDetailsFromCaseManagerPage(application)
  const doesNotHaveCaseManagementResponsibility =
    retrieveOptionalQuestionResponseFromFormArtifact(
      application,
      ConfirmYourDetails,
      'caseManagementResponsibility',
    ) === 'no'

  return {
    applicantUserDetails: Object.keys(applicantUserDetails).length ? applicantUserDetails : undefined,
    caseManagerUserDetails: doesNotHaveCaseManagementResponsibility ? caseManagerUserDetails : undefined,
    caseManagerIsNotApplicant: doesNotHaveCaseManagementResponsibility,
  }
}
