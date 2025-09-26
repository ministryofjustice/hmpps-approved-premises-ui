import { createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { ApplicationService } from '../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared'
import { applicationFactory, placementApplicationFactory } from '../../../testutils/factories'

import CheckYourAnswers from './checkYourAnswers'

describe('CheckYourAnswers', () => {
  const body = {
    reviewed: '1',
  }
  const placementApplication = placementApplicationFactory.build()

  describe('initialize', () => {
    it('fetches the application and attaches it to the object', async () => {
      const application = applicationFactory.build()
      const findApplicationMock = jest.fn()

      const applicationService = createMock<ApplicationService>({
        findApplication: findApplicationMock,
      })

      findApplicationMock.mockResolvedValue(application)

      const page = await CheckYourAnswers.initialize(
        body,
        placementApplication,
        'some-token',
        fromPartial({ applicationService }),
      )

      expect(page).toBeInstanceOf(CheckYourAnswers)
      expect(page.application).toEqual(application)

      expect(applicationService.findApplication).toHaveBeenCalledWith('some-token', placementApplication.applicationId)
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new CheckYourAnswers(body, placementApplication)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new CheckYourAnswers(body, placementApplication), '')
  itShouldHavePreviousValue(new CheckYourAnswers(body, placementApplication), 'updates-to-application')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new CheckYourAnswers({}, placementApplication)

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      const page = new CheckYourAnswers({}, placementApplication)

      expect(page.response()).toEqual({})
    })
  })
})
