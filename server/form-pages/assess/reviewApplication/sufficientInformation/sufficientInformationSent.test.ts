import { when } from 'jest-when'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationSent from './sufficientInformationSent'

import { assessmentFactory } from '../../../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ConfirmYourDetails from '../../../apply/reasons-for-placement/basic-information/confirmYourDetails'
import {
  userDetailsFromCaseManagerPage,
  userDetailsFromConfirmYourDetailsPage,
} from '../../../../utils/applications/userDetailsFromApplication'
import { applicationUserDetailsFactory } from '../../../../testutils/factories/application'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')
jest.mock('../../../../utils/applications/userDetailsFromApplication')

describe('SufficientInformationSent', () => {
  const assessment = assessmentFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformationSent({}, assessment).title).toBe('How to get further information')
  })

  describe('constructor', () => {
    describe('if there are user details on the application', () => {
      describe('if the applicant is the case manager', () => {
        it('should set the case manager details with the applicants details on the page', () => {
          const assessmentWithApplication = assessmentFactory.build({
            application: {
              caseManagerIsNotApplicant: false,
            },
          })

          const page = new SufficientInformationSent({}, assessmentWithApplication)
          expect(page.caseManager).toEqual(assessmentWithApplication.application.applicantUserDetails)
        })
      })

      describe('if the applicant is not the case manager', () => {
        it('should set the case manager details', () => {
          const assessmentWithApplication = assessmentFactory.build({
            application: {
              caseManagerIsNotApplicant: true,
            },
          })

          const page = new SufficientInformationSent({}, assessmentWithApplication)
          expect(page.caseManager).toEqual(assessmentWithApplication.application.caseManagerUserDetails)
        })
      })
    })

    describe('if there are not user details on the application', () => {
      const legacyAsssessmentWithoutUserDetails = assessmentFactory.build({
        application: {
          caseManagerIsNotApplicant: undefined,
          caseManagerUserDetails: undefined,
          applicantUserDetails: undefined,
        },
      })

      describe('if the applicant is the case manager', () => {
        it('should set the case manager details on the page with details from the form data', () => {
          const applicantDetails = applicationUserDetailsFactory.build()

          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(
              legacyAsssessmentWithoutUserDetails.application,
              ConfirmYourDetails,
              'caseManagementResponsibility',
            )
            .mockReturnValue('yes')

          when(userDetailsFromConfirmYourDetailsPage)
            .calledWith(legacyAsssessmentWithoutUserDetails.application)
            .mockReturnValue(applicantDetails)

          const page = new SufficientInformationSent({}, legacyAsssessmentWithoutUserDetails)
          expect(page.caseManager).toEqual(applicantDetails)
        })
      })

      describe('if the applicant is not the case manager', () => {
        it('should set the case manager details on the page with details from the form data', () => {
          const caseManagerDetails = applicationUserDetailsFactory.build()
          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(
              legacyAsssessmentWithoutUserDetails.application,
              ConfirmYourDetails,
              'caseManagementResponsibility',
            )
            .mockReturnValue('no')

          when(userDetailsFromCaseManagerPage)
            .calledWith(legacyAsssessmentWithoutUserDetails.application)
            .mockReturnValue(caseManagerDetails)

          const page = new SufficientInformationSent({}, legacyAsssessmentWithoutUserDetails)

          expect(page.caseManager).toEqual(caseManagerDetails)
        })
      })
    })
  })

  itShouldHavePreviousValue(new SufficientInformationSent({}, assessment), '')
  itShouldHaveNextValue(new SufficientInformationSent({}, assessment), 'information-received')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new SufficientInformationSent({}, assessment)

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      const page = new SufficientInformationSent({}, assessment)

      expect(page.response()).toEqual({})
    })
  })
})
