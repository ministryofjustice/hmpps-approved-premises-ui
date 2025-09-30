import { SpaceSearchFormData } from '@approved-premises/ui'
import { ValidationError } from '../errors'
import { criteriaSummaryList, newPlacementSummaryList, validateNewPlacement } from './newPlacement'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'

describe('new placement utils', () => {
  describe('validateNewPlacement', () => {
    const validBody = {
      arrivalDate: '01/01/2026',
      departureDate: '01/01/2027',
      reason: 'foo',
    }

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-25'))
    })

    it.each([
      [
        'fields are empty',
        { arrivalDate: '', departureDate: '', reason: '' },
        {
          arrivalDate: 'Enter or select an arrival date',
          departureDate: 'Enter or select a departure date',
          reason: 'Enter a reason',
        },
      ],
      [
        'the arrival and end dates are invalid',
        { arrivalDate: '32/2/2026', departureDate: 'not a date' },
        {
          arrivalDate: 'Enter a valid arrival date',
          departureDate: 'Enter a valid departure date',
        },
      ],
      [
        'the arrival and departure dates are in the past',
        { arrivalDate: '01/01/2024', departureDate: '01/01/2025' },
        {
          arrivalDate: 'The arrival date must be in the future',
          departureDate: 'The departure date must be in the future',
        },
      ],
      [
        'the departure date is before the start date',
        { departureDate: '12/12/2025' },
        { departureDate: 'The departure date must be after the arrival date' },
      ],
    ])('throws an error when %s', (_, body, expectedErrors) => {
      const fullBody = { ...validBody, ...body }

      let error
      try {
        validateNewPlacement(fullBody)
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.data).toEqual(expectedErrors)
    })
  })

  describe('criteriaSummaryList', () => {
    it('returns a summary list for a placement request with no requirements', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build({
        type: 'normal',
        essentialCriteria: [],
      })

      expect(criteriaSummaryList(placementRequest)).toEqual({
        rows: [
          { key: { text: 'AP type' }, value: { text: 'Standard AP' } },
          { key: { text: 'AP criteria' }, value: { html: '<span class="text-grey">None</span>' } },
          { key: { text: 'Room criteria' }, value: { html: '<span class="text-grey">None</span>' } },
        ],
      })
    })

    it('returns a summary list for a placement request with requirements', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build({
        type: 'pipe',
        essentialCriteria: ['isCatered', 'isWheelchairDesignated', 'isStepFreeDesignated'],
      })

      expect(criteriaSummaryList(placementRequest)).toEqual({
        rows: [
          { key: { text: 'AP type' }, value: { text: 'Psychologically Informed Planned Environment (PIPE)' } },
          {
            key: { text: 'AP criteria' },
            value: { html: '<ul class="govuk-list govuk-list--bullet"><li>Catered</li></ul>' },
          },
          {
            key: { text: 'Room criteria' },
            value: {
              html: '<ul class="govuk-list govuk-list--bullet"><li>Wheelchair accessible</li><li>Step-free</li></ul>',
            },
          },
        ],
      })
    })
  })

  describe('newPlacementSummaryList', () => {
    it('renders summary list items for a search state with new placement details', () => {
      const searchState: SpaceSearchFormData = {
        arrivalDate: '2026-04-14',
        departureDate: '2026-05-07',
        newPlacementReason: 'Because',
        apCriteria: ['acceptsSexOffenders'],
        roomCriteria: ['isArsonSuitable', 'isWheelchairDesignated'],
        apType: 'isESAP',
      }

      expect(newPlacementSummaryList(searchState)).toEqual({
        rows: [
          { key: { text: 'Expected arrival date' }, value: { text: 'Tue 14 Apr 2026' } },
          { key: { text: 'Expected departure date' }, value: { text: 'Thu 7 May 2026' } },
          { key: { text: 'Length of stay' }, value: { text: '3 weeks, 2 days' } },
          { key: { text: 'Type of AP' }, value: { text: 'Enhanced Security AP (ESAP)' } },
          {
            key: { text: 'AP requirements' },
            value: { html: '<ul class="govuk-list govuk-list--bullet"><li>Sexual offences against adults</li></ul>' },
          },
          {
            key: { text: 'Room requirements' },
            value: {
              html: '<ul class="govuk-list govuk-list--bullet"><li>Wheelchair accessible</li><li>Suitable for active arson risk</li></ul>',
            },
          },
          { key: { text: 'Reason' }, value: { html: '<span class="govuk-summary-list__textblock">Because</span>' } },
        ],
      })
    })

    it('returns undefined if no new placement details are present', () => {
      const searchState: SpaceSearchFormData = {
        arrivalDate: '2026-04-14',
        departureDate: '2026-05-07',
        apCriteria: ['acceptsSexOffenders'],
        roomCriteria: ['isArsonSuitable', 'isWheelchairDesignated'],
        apType: 'isESAP',
      }

      expect(newPlacementSummaryList(searchState)).toEqual(undefined)
    })
  })
})
