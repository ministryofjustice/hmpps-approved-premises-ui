import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformation from './sufficientInformation'

describe('SufficientInformation', () => {
  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new SufficientInformation({}, assessment).title).toBe(
      'Is there enough information in the application for you to make a decision?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment)
      expect(page.body).toEqual({ sufficientInformation: 'yes' })
    })
  })

  describe('when sufficientInformation is yes', () => {
    itShouldHaveNextValue(new SufficientInformation({ sufficientInformation: 'yes' }, assessment), '')
  })

  describe('when sufficientInformation is no', () => {
    itShouldHaveNextValue(
      new SufficientInformation({ sufficientInformation: 'no' }, assessment),
      'sufficient-information-confirm',
    )
  })

  itShouldHavePreviousValue(new SufficientInformation({}, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformation({}, assessment)

      expect(page.errors()).toEqual({
        sufficientInformation: 'You must confirm if there is enough information in the application to make a decision',
      })
    })

    it('should have an error if the answer is no and no query is specified', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no' }, assessment)

      expect(page.errors()).toEqual({
        query: 'You must specify what additional information is needed',
      })
    })
  })

  describe('response', () => {
    it('returns the sufficientInformation response when the answer is yes and an empty string for the query', () => {
      const page = new SufficientInformation({ sufficientInformation: 'yes' }, assessment)

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'Yes',
        'What additional information is needed?': '',
      })
    })

    it('returns both responses when the answer is no', () => {
      const page = new SufficientInformation({ sufficientInformation: 'no', query: 'some query' }, assessment)

      expect(page.response()).toEqual({
        'Is there enough information in the application for you to make a decision?': 'No',
        'What additional information is needed?': 'some query',
      })
    })
  })
})
