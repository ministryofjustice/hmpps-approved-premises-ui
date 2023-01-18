import { createMock } from '@golevelup/ts-jest'

import { UserService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RequestInformation from './requestInformation'

import assessmentFactory from '../../../../testutils/factories/assessment'
import userFactory from '../../../../testutils/factories/user'

describe('RequestInformation', () => {
  const user = userFactory.build()
  const assessment = assessmentFactory.build()

  describe('title', () => {
    expect(new RequestInformation().title).toBe('Request information from probation practicioner')
  })

  describe('body', () => {
    it('should set have an empty body', () => {
      const page = new RequestInformation()
      expect(page.body).toEqual({})
    })
  })

  describe('initialize', () => {
    it('should fetch the user and return the page', async () => {
      const getUserByIdMock = jest.fn()

      const userService = createMock<UserService>({
        getUserById: getUserByIdMock,
      })

      getUserByIdMock.mockResolvedValue(user)

      const page = await RequestInformation.initialize({}, assessment, 'some-token', { userService })

      expect(page).toBeInstanceOf(RequestInformation)
      expect(page.user).toEqual(user)

      expect(userService.getUserById).toHaveBeenCalledWith('some-token', assessment.application.createdByUserId)
    })
  })

  itShouldHaveNextValue(new RequestInformation(), '')

  itShouldHavePreviousValue(new RequestInformation(), 'sufficient-information')

  describe('errors', () => {
    it('should return blank', () => {
      const page = new RequestInformation()

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('returns blank', () => {
      const page = new RequestInformation()

      expect(page.response()).toEqual({})
    })
  })
})
