import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

import { applicationFactory } from '../../../../testutils/factories'

import PlacementPurpose from './placementPurpose'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('PlacementPurpose', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: ['publicProtection', 'readjust'],
        },
        application,
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
      )

      expect(page.body).toEqual({
        placementPurposes: ['otherReason'],
        otherReason: 'Another reason',
      })
    })
  })

  itShouldHaveNextValue(new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application), '')

  describe('when the notice type is standard', () => {
    describe('when the applicant knows the release date', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('yes')

      expect(new PlacementPurpose({}, application).previous()).toBe('placement-date')
    })

    describe('when the applicant doesnt know the release date', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('no')

      expect(new PlacementPurpose({}, application).previous()).toBe('oral-hearing')
    })
  })

  describe('when the notice type is emergency', () => {
    beforeEach(() => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
    })

    itShouldHavePreviousValue(new PlacementPurpose({}, application), 'reason-for-short-notice')
  })

  describe('when the notice type is shortNotice', () => {
    beforeEach(() => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('shortNotice')
    })

    itShouldHavePreviousValue(new PlacementPurpose({}, application), 'reason-for-short-notice')
  })

  describe('errors', () => {
    it('should return an empty object if the placement purpose is specified as a reason other than "Other reason"', () => {
      const page = new PlacementPurpose({ placementPurposes: ['publicProtection'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the placementPurpose is "Other reason" and the reason is note given', () => {
      const page = new PlacementPurpose({ placementPurposes: ['otherReason'] }, application)
      expect(page.errors()).toEqual({ otherReason: 'You must explain the reason' })
    })
  })

  it('should return an error if the reason is not populated', () => {
    const page = new PlacementPurpose({}, application)
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
      )

      expect(page.response()).toEqual({
        [page.title]:
          'Public protection, Prevent contact with known individuals or victims, Help individual readjust to life outside of custody, Provide drug or alcohol monitoring, Increased monitoring of risk factors',
      })
    })

    it('should include an other reason if one is present', () => {
      const page = new PlacementPurpose(
        {
          placementPurposes: ['drugAlcoholMonitoring', 'otherReason'],
          otherReason: 'Another reason',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Provide drug or alcohol monitoring, Other',
        'Other purpose for AP Placement': 'Another reason',
      })
    })
  })

  describe('items', () => {
    it('it returns radio buttons with a divider and conditional HTML for the `other` option', () => {
      const page = new PlacementPurpose({}, application)
      const items = page.items('<strong>Some HTML</strong>')

      expect(items).toEqual([
        { checked: false, text: 'Public protection', value: 'publicProtection' },
        { checked: false, text: 'Prevent contact with known individuals or victims', value: 'preventContact' },
        { checked: false, text: 'Help individual readjust to life outside of custody', value: 'readjust' },
        { checked: false, text: 'Provide drug or alcohol monitoring', value: 'drugAlcoholMonitoring' },
        { checked: false, text: 'Increased monitoring of risk factors', value: 'preventSelfHarm' },
        { divider: 'or' },
        {
          checked: false,
          conditional: { html: '<strong>Some HTML</strong>' },
          text: 'Other',
          value: 'otherReason',
        },
      ])
    })
  })
})
