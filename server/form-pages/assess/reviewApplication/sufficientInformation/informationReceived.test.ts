import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import InformationReceived from './informationReceived'

describe('InformationReceived', () => {
  describe('title', () => {
    expect(new InformationReceived({ informationReceived: 'yes' }).title).toBe(
      'Have you received additional information from the probation practitioner?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new InformationReceived({
        informationReceived: 'yes',
        'responseReceivedOn-year': '2022',
        'responseReceivedOn-month': '3',
        'responseReceivedOn-day': '3',
        response: 'some text',
      })
      expect(page.body).toEqual({
        informationReceived: 'yes',
        response: 'some text',
        'responseReceivedOn-year': '2022',
        'responseReceivedOn-month': '3',
        'responseReceivedOn-day': '3',
        responseReceivedOn: '2022-03-03',
      })
    })
  })

  itShouldHaveNextValue(new InformationReceived({ informationReceived: 'yes' }), '')
  itShouldHavePreviousValue(new InformationReceived({ informationReceived: 'yes' }), '')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new InformationReceived({})

      expect(page.errors()).toEqual({
        informationReceived:
          'You must confirm if you have received additional information from the probation practitioner',
      })
    })

    it('should have an error if the answer is yes and no response is specified', () => {
      const page = new InformationReceived({
        informationReceived: 'yes',
        'responseReceivedOn-year': '2022',
        'responseReceivedOn-month': '3',
        'responseReceivedOn-day': '3',
      })

      expect(page.errors()).toEqual({
        response: 'You must specify the information you have received',
      })
    })

    it('should have an error if the answer is yes and no date is specified', () => {
      const page = new InformationReceived({
        informationReceived: 'yes',
        response: 'some text',
      })

      expect(page.errors()).toEqual({
        responseReceivedOn: 'You must specify when you received the information',
      })
    })

    it('should have an error if the answer is yes and the date is invalid', () => {
      const page = new InformationReceived({
        informationReceived: 'yes',
        response: 'some text',
        'responseReceivedOn-year': '5765757567',
        'responseReceivedOn-month': '6453',
        'responseReceivedOn-day': '3',
      })

      expect(page.errors()).toEqual({
        responseReceivedOn: 'The date is invalid',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const body = {
        informationReceived: 'yes' as const,
        'responseReceivedOn-year': '2022',
        'responseReceivedOn-month': '3',
        'responseReceivedOn-day': '3',
        responseReceivedOn: '2022-03-03',
        response: 'some text',
      }
      const page = new InformationReceived(body)

      expect(page.response()).toEqual({
        'Have you received additional information from the probation practitioner?': 'Yes',
        'Provide the additional information received from the probation practitioner': 'some text',
        'When did you receive this information?': DateFormats.dateAndTimeInputsToUiDate(body, 'responseReceivedOn'),
      })
    })
  })
})
