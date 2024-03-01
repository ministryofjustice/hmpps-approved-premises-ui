import { when } from 'jest-when'
import { applicationFactory } from '../../testutils/factories'
import { userDetailsFromCaseManagerPage, userDetailsFromConfirmYourDetailsPage } from './userDetailsFromApplication'
import { applicantAndCaseManagerDetails } from './applicantAndCaseManagerDetails'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import ConfirmYourDetails from '../../form-pages/apply/reasons-for-placement/basic-information/confirmYourDetails'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'

jest.mock('./userDetailsFromApplication')
jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('applicantAndCaseManagerDetails', () => {
  describe('when the case manager is the applicant', () => {
    it('returns the applicant details, undefined for caseManagerUserDetails and false for caseManagerIsNotApplicant', () => {
      const application = applicationFactory.build()
      const applicantUserDetails = applicationUserDetailsFactory.build()

      when(userDetailsFromConfirmYourDetailsPage).calledWith(application).mockReturnValue(applicantUserDetails)

      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, ConfirmYourDetails, 'caseManagementResponsibility')
        .mockReturnValue('yes')

      const result = applicantAndCaseManagerDetails(application)

      expect(result.applicantUserDetails).toEqual(applicantUserDetails)
      expect(result.caseManagerIsNotApplicant).toEqual(false)
      expect(result.caseManagerUserDetails).toEqual(undefined)
    })
  })

  describe('when the case manager is not the applicant', () => {
    it('returns the applicant details, the caseManagerUserDetails and true for caseManagerIsNotApplicant', () => {
      const application = applicationFactory.build()
      const applicantUserDetails = applicationUserDetailsFactory.build()
      const caseManagerUserDetails = applicationUserDetailsFactory.build()

      when(userDetailsFromConfirmYourDetailsPage).calledWith(application).mockReturnValue(applicantUserDetails)
      when(userDetailsFromCaseManagerPage).calledWith(application).mockReturnValue(caseManagerUserDetails)

      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, ConfirmYourDetails, 'caseManagementResponsibility')
        .mockReturnValue('no')

      const result = applicantAndCaseManagerDetails(application)

      expect(result.applicantUserDetails).toEqual(applicantUserDetails)
      expect(result.caseManagerIsNotApplicant).toEqual(true)
      expect(result.caseManagerUserDetails).toEqual(caseManagerUserDetails)
    })
  })
})
