import { createMock } from '@golevelup/ts-jest'

import { UserService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformation from './sufficientInformation'

import assessmentFactory from '../../../../testutils/factories/assessment'
import userFactory from '../../../../testutils/factories/user'

describe('SufficientInformation', () => {
  const user = userFactory.build()
  const assessment = assessmentFactory.build()

  describe('title', () => {
    expect(new SufficientInformation({}).title).toBe(
      'Is there enough information in the application to make a decision?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' })
      expect(page.body).toEqual({ sufficientInformation: 'yes' })
    })
  })

  describe('initialize', () => {
    it('should fetch the user and return the page', async () => {
      const getUserByIdMock = jest.fn()

      const userService = createMock<UserService>({
        getUserById: getUserByIdMock,
      })

      getUserByIdMock.mockResolvedValue(user)

      const page = await SufficientInformation.initialize({}, assessment, 'some-token', { userService })

      expect(page).toBeInstanceOf(SufficientInformation)
      expect(page.user).toEqual(user)

      expect(userService.getUserById).toHaveBeenCalledWith('some-token', assessment.application.createdByUserId)
    })
  })

  itShouldHaveNextValue(new SufficientInformation({}), '')

  itShouldHavePreviousValue(new SufficientInformation({}), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformation({})

      expect(page.errors()).toEqual({
        sufficientInformation: 'You must confirm if there is enough information in the application to make a decision',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' })

      expect(page.response()).toEqual({
        'Is there enough information in the application to make a decision?': 'Yes',
      })
    })
  })
})
