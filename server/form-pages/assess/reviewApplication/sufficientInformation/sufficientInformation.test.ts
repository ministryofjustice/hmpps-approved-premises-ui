import { createMock } from '@golevelup/ts-jest'

import { fromPartial } from '@total-typescript/shoehorn'
import { UserService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformation from './sufficientInformation'

import { assessmentFactory, userFactory } from '../../../../testutils/factories'

describe('SufficientInformation', () => {
  const user = userFactory.build()
  const assessment = assessmentFactory.build()

  describe('title', () => {
    expect(new SufficientInformation({}).title).toBe(
      'Is there enough information in the application for you to make a decision?',
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

      const page = await SufficientInformation.initialize({}, assessment, 'some-token', fromPartial({ userService }))

      expect(page).toBeInstanceOf(SufficientInformation)
      expect(page.user).toEqual(user)

      expect(userService.getUserById).toHaveBeenCalledWith('some-token', assessment.application.createdByUserId)
    })
  })

  describe('when sufficientInformation is yes', () => {
    itShouldHaveNextValue(new SufficientInformation({ sufficientInformation: 'yes' }), '')
  })

  describe('when sufficientInformation is no', () => {
    itShouldHaveNextValue(new SufficientInformation({ sufficientInformation: 'no' }), 'information-received')
  })

  itShouldHavePreviousValue(new SufficientInformation({}), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformation({})

      expect(page.errors()).toEqual({
        sufficientInformation: 'You must confirm if there is enough information in the application to make a decision',
      })
    })

    it('should have an error if the answer is no and no query is specified', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' })

      expect(page.errors()).toEqual({
        query: 'You must specify what additional information is required',
      })
    })
  })

  describe('response', () => {
    it('returns the sufficientInformation response when the answer is yes and an empty string for the query', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' })

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'Yes',
        'What additional information is required?': '',
      })
    })

    it('returns both responses when the answer is no', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no', query: 'some query' })

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'No',
        'What additional information is required?': 'some query',
      })
    })
  })
})
