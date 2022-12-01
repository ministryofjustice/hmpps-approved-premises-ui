import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import applicationFactory from '../../../../testutils/factories/application'

import PlacementPurpose from './placementPurpose'

describe('PlacementPurpose', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection', 'readjust'],
        },
        application,
        'previousPage',
      )

      expect(page.body).toEqual({
        placementPurposes: ['publicProtection', 'readjust'],
      })
    })

    it('should strip otherReason unless the placement purpose is "Other reason"', () => {
      const pageWithOtherReason = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection', 'otherReason'],
          otherReason: 'Another reason',
        },
        application,
        'previousPage',
      )

      expect(pageWithOtherReason.body).toEqual({
        placementPurposes: ['publicProtection', 'otherReason'],
        otherReason: 'Another reason',
      })

      const pageWithoutOtherReason = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection'],
          otherReason: 'Another reason',
        },
        application,
        'previousPage',
      )

      expect(pageWithoutOtherReason.body).toEqual({
        placementPurposes: ['publicProtection'],
      })
    })

    it('should apply `otherReason` to the body when `otherReason` is the only `placementPurposes` option', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: 'otherReason',
          otherReason: 'Another reason',
        },
        application,
        'previousPage',
      )

      expect(page.body).toEqual({
        placementPurposes: ['otherReason'],
        otherReason: 'Another reason',
      })
    })
  })

  describe('when knowReleaseDate is set to yes', () => {
    itShouldHaveNextValue(
      new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application, 'somePage'),
      '',
    )
  })

  describe("previous returns the value passed into the previousPage parameter of the object's constructor", () => {
    itShouldHavePreviousValue(new PlacementPurpose({}, application, 'previousPage'), 'previousPage')
  })

  describe('errors', () => {
    it('should return an empty object if the placement purpose is specified as a reason other than "Other reason"', () => {
      const page = new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application, 'somePage')
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the placementPurpose is "Other reason" and the reason is note given', () => {
      const page = new PlacementPurpose({ placementPurposes: ['otherReason'] }, application, 'somePage')
      expect(page.errors()).toEqual({ otherReason: 'You must explain the reason' })
    })
  })

  it('should return an error if the reason is not populated', () => {
    const page = new PlacementPurpose({}, application, 'somePage')
    expect(page.errors()).toEqual({ placementPurposes: 'You must choose at least one placement purpose' })
  })

  describe('response', () => {
    it('should return a translated version of the placement purposes', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: [
            'publicProtection',
            'preventContact',
            'readjust',
            'drugAlcoholMonitoring',
            'preventSelfHarm',
          ],
        },
        application,
        'somePage',
      )

      expect(page.response()).toEqual({
        [page.title]:
          'Public protection, Prevent contact, Help individual readjust to life outside custody, Provide drug or alcohol monitoring, Prevent self harm or suicide',
      })
    })

    it('should include an other reason if one is present', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: ['drugAlcoholMonitoring', 'otherReason'],
          otherReason: 'Another reason',
        },
        application,
        'somePage',
      )

      expect(page.response()).toEqual({
        [page.title]: 'Provide drug or alcohol monitoring, Other (please specify)',
        'Other purpose for AP Placement': 'Another reason',
      })
    })
  })

  describe('items', () => {
    it('it returns radio buttons with a divider and conditional HTML for the `other` option', () => {
      const page = new PlacementPurpose({}, application, 'somePage')
      const items = page.items('<strong>Some HTML</strong>')

      expect(items).toEqual([
        { checked: false, text: 'Public protection', value: 'publicProtection' },
        { checked: false, text: 'Prevent contact', value: 'preventContact' },
        { checked: false, text: 'Help individual readjust to life outside custody', value: 'readjust' },
        { checked: false, text: 'Provide drug or alcohol monitoring', value: 'drugAlcoholMonitoring' },
        { checked: false, text: 'Prevent self harm or suicide', value: 'preventSelfHarm' },
        { divider: 'or' },
        {
          checked: false,
          conditional: { html: '<strong>Some HTML</strong>' },
          text: 'Other (please specify)',
          value: 'otherReason',
        },
      ])
    })
  })
})
