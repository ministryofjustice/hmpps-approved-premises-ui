import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationSent from './sufficientInformationSent'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import { assessmentFactory, userFactory } from '../../../../testutils/factories'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('SufficientInformationSent', () => {
  const assessment = assessmentFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformationSent({}, assessment).title).toBe('How to get further information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformationSent({}, assessment)
      expect(page.body).toEqual({})
    })
  })

  describe('initialize', () => {
    it("should get the applicant's details", () => {
      const body = {}
      const user = userFactory.build()
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock)
        .mockReturnValueOnce(user.name)
        .mockReturnValueOnce(user.email)
        .mockReturnValue(user.telephoneNumber)

      const page = new SufficientInformationSent({}, assessment)

      expect(page.body).toEqual(body)
      expect(page.userName).toEqual(user.name)
      expect(page.emailAddress).toEqual(user.email)
      expect(page.phoneNumber).toEqual(user.telephoneNumber)
    })
    it("should get the fall back applicant's details", () => {
      const body = {}
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValue(undefined)

      const page = new SufficientInformationSent({}, assessment)

      expect(page.body).toEqual(body)
      expect(page.userName).toEqual('')
      expect(page.emailAddress).toEqual('')
      expect(page.phoneNumber).toEqual('')
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
