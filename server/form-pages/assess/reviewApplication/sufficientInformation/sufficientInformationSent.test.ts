import { createMock } from '@golevelup/ts-jest'

import { fromPartial } from '@total-typescript/shoehorn'
import { UserService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationSent from './sufficientInformationSent'

import { assessmentFactory, userFactory } from '../../../../testutils/factories'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('SufficientInformationSent', () => {
  const assessment = assessmentFactory.build()
  const userService = createMock<UserService>({})

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformationSent({}).title).toBe('How to get further information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformationSent({})
      expect(page.body).toEqual({})
    })
  })

  describe('initialize', () => {
    it("should get the applicant's details", async () => {
      const body = {}
      const user = userFactory.build()
      userService.getUserById.mockResolvedValue(user)

      const page = await SufficientInformationSent.initialize(body, assessment, 'token', fromPartial({ userService }))

      expect(page.body).toEqual(body)
      expect(page.user).toEqual(user)
      expect(userService.getUserById).toHaveBeenCalledWith('token', assessment.application.createdByUserId)
    })
  })

  itShouldHavePreviousValue(new SufficientInformationSent({}), '')
  itShouldHaveNextValue(new SufficientInformationSent({}), 'information-received')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new SufficientInformationSent({})

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      const page = new SufficientInformationSent({})

      expect(page.response()).toEqual({})
    })
  })
})
