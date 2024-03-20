import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationSent from './sufficientInformationSent'

import { applicationFactory, assessmentFactory } from '../../../../testutils/factories'

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
      it('should set the case manager details with the applicants details on the page', () => {
        const page = new SufficientInformationSent({}, assessment)
        expect(page.applicant).toEqual(assessment.application.applicantUserDetails)
        expect(page.caseManager).toEqual(assessment.application.caseManagerUserDetails)
      })
    })

    describe('if the user details are missing fields', () => {
      it('returns "no $fieldName is supplied"', () => {
        const application = applicationFactory.build({
          applicantUserDetails: undefined,
          caseManagerUserDetails: undefined,
        })

        const assessmentWithoutUserDetails = assessmentFactory.build({
          application,
        })

        const page = new SufficientInformationSent({}, assessmentWithoutUserDetails)

        expect(page.applicant).toEqual({
          email: 'No email supplied',
          name: 'No name supplied',
          telephoneNumber: 'No telephone number supplied',
        })
        expect(page.caseManager).toEqual({
          email: 'No email supplied',
          name: 'No name supplied',
          telephoneNumber: 'No telephone number supplied',
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
