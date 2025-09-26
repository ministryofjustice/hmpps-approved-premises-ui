import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue } from '../../shared'

import AdditionalPlacementDetails, { Body } from './additionalPlacementDetails'
import { DateFormats } from '../../../utils/dateUtils'
import { placementApplicationFactory } from '../../../testutils/factories'

describe('AdditionalPlacementDetails', () => {
  const body = {
    durationDays: '5',
    durationWeeks: '1',
    'arrivalDate-year': '2023',
    'arrivalDate-month': '12',
    'arrivalDate-day': '1',
    reason: 'Some reason',
  } as Body

  const placementApplicaton = placementApplicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new AdditionalPlacementDetails(body, placementApplicaton)

      expect(page.body).toEqual({
        duration: '12',
        durationDays: '5',
        durationWeeks: '1',
        'arrivalDate-year': '2023',
        'arrivalDate-month': '12',
        'arrivalDate-day': '1',
        arrivalDate: '2023-12-01',
        reason: 'Some reason',
      })
    })
  })

  it('previous should return to sentence type check page if the sentence/release type have not been changed', () => {
    expect(new AdditionalPlacementDetails(body, placementApplicaton).previous()).toEqual('sentence-type-check')
  })

  it('previous should return to the release type page if the sentence/release type has been changed', () => {
    const placementApplicationChanged = {
      ...placementApplicaton,
      data: {
        'request-a-placement': {
          'sentence-type-check': {
            sentenceTypeCheck: 'yes',
          },
          'sentence-type': {
            sentenceType: 'standardDeterminate',
          },
        },
      },
    }
    expect(new AdditionalPlacementDetails(body, placementApplicationChanged).previous()).toEqual('release-type')
  })

  itShouldHaveNextValue(new AdditionalPlacementDetails(body, placementApplicaton), 'updates-to-application')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new AdditionalPlacementDetails(body, placementApplicaton)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if additionalPlacementDetails is blank', () => {
      const page = new AdditionalPlacementDetails(fromPartial({}), placementApplicaton)
      expect(page.errors()).toEqual({
        arrivalDate: "You must state the person's arrival date",
        duration: 'You must state the duration of the placement',
        reason: 'You must state the reason for the placement',
      })
    })

    it('should return errors if the last placement date is invalid', () => {
      const page = new AdditionalPlacementDetails(
        {
          ...body,
          'arrivalDate-year': '99999',
          'arrivalDate-month': '99999',
          'arrivalDate-day': '199999',
        },
        placementApplicaton,
      )
      expect(page.errors()).toEqual({
        arrivalDate: 'The placement date is invalid',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new AdditionalPlacementDetails(body, placementApplicaton)

      expect(page.response()).toEqual({
        'How long should the Approved Premises placement last?': '1 week, 5 days',
        'When will the person arrive?': DateFormats.dateAndTimeInputsToUiDate(body, 'arrivalDate'),
        'Why are you requesting this placement?': 'Some reason',
      })
    })
  })
})
