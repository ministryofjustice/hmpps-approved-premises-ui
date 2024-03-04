import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import DecisionToRelease, { Body } from './decisionToRelease'
import { DateFormats } from '../../../utils/dateUtils'

describe('DecisionToRelease', () => {
  const body = {
    duration: '12',
    informationFromDirectionToRelease: 'Some information',
    'decisionToReleaseDate-year': '2023',
    'decisionToReleaseDate-month': '12',
    'decisionToReleaseDate-day': '1',
  } as Body

  describe('body', () => {
    it('should set the body', () => {
      const page = new DecisionToRelease(body)

      expect(page.body).toEqual({
        'decisionToReleaseDate-year': '2023',
        'decisionToReleaseDate-month': '12',
        'decisionToReleaseDate-day': '1',
        decisionToReleaseDate: '2023-12-01',
        informationFromDirectionToRelease: 'Some information',
      })
    })
  })

  itShouldHavePreviousValue(new DecisionToRelease(body), 'reason-for-placement')

  itShouldHaveNextValue(new DecisionToRelease(body), 'additional-documents')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new DecisionToRelease(body)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if decisionToRelease is blank', () => {
      const page = new DecisionToRelease(fromPartial({}))
      expect(page.errors()).toEqual({
        decisionToReleaseDate: 'You must state the date of the decision to release',
        informationFromDirectionToRelease: 'You must state the relevant information from the direction to release',
      })
    })

    it('should return errors if the last decision to release date is invalid', () => {
      const page = new DecisionToRelease({
        ...body,
        'decisionToReleaseDate-year': '99999',
        'decisionToReleaseDate-month': '99999',
        'decisionToReleaseDate-day': '199999',
      })
      expect(page.errors()).toEqual({
        decisionToReleaseDate: 'The decision to release date is invalid',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DecisionToRelease(body)

      expect(page.response()).toEqual({
        'Enter the date of decision': DateFormats.dateAndTimeInputsToUiDate(body, 'decisionToReleaseDate'),
        'Provide relevant information from the direction to release that will impact the placement': 'Some information',
      })
    })
  })
})
