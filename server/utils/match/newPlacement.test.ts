import { SpaceSearchFormData } from '@approved-premises/ui'
import { ValidationError } from '../errors'
import { criteriaSummaryList, newPlacementSummaryList, validateNewPlacement } from './newPlacement'
import { cas1PlacementRequestDetailFactory, cas1SpaceBookingSummaryFactory } from '../../testutils/factories'

describe('new placement utils', () => {
  describe('validateNewPlacement', () => {
    const validBody = {
      newPlacementArrivalDate: '01/01/2026',
      newPlacementDepartureDate: '01/01/2027',
      newPlacementReason: 'foo',
    }

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-25'))
    })

    it.each([
      [
        'fields are empty',
        { newPlacementArrivalDate: '', newPlacementDepartureDate: '', newPlacementReason: '' },
        {
          newPlacementArrivalDate: 'Enter or select an arrival date',
          newPlacementDepartureDate: 'Enter or select a departure date',
          newPlacementReason: 'Enter a reason',
        },
      ],
      [
        'the arrival and end dates are invalid',
        { newPlacementArrivalDate: '32/2/2026', newPlacementDepartureDate: 'not a date' },
        {
          newPlacementArrivalDate: 'Enter a valid arrival date',
          newPlacementDepartureDate: 'Enter a valid departure date',
        },
      ],
      [
        'the arrival and departure dates are in the past',
        { newPlacementArrivalDate: '01/01/2024', newPlacementDepartureDate: '01/01/2025' },
        {
          newPlacementArrivalDate: 'The arrival date must be in the future',
          newPlacementDepartureDate: 'The departure date must be in the future',
        },
      ],
      [
        'the departure date is before the start date',
        { newPlacementDepartureDate: '12/12/2025' },
        { newPlacementDepartureDate: 'The departure date must be after the arrival date' },
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
    const searchState: SpaceSearchFormData = {
      newPlacementArrivalDate: '14/4/2026',
      newPlacementDepartureDate: '7/5/2026',
      newPlacementReason: 'Because',
      apCriteria: ['acceptsSexOffenders'],
      roomCriteria: ['isArsonSuitable', 'isWheelchairDesignated'],
      apType: 'isESAP',
    }

    it('renders summary list items for a search state with new placement details', () => {
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

    it('returns the current placement premises name if the placement exists', () => {
      const currentPlacement = cas1SpaceBookingSummaryFactory.current().build({
        premises: {
          name: 'The current premises name',
        },
      })
      const summaryList = newPlacementSummaryList(searchState, currentPlacement)
      expect(summaryList.rows).toHaveLength(8)
      expect(summaryList.rows[0]).toEqual({
        key: { text: 'Current AP' },
        value: { text: 'The current premises name' },
      })
    })

    it('returns undefined if no new placement details are present', () => {
      const searchStateNoNewPlacement: SpaceSearchFormData = {
        apCriteria: ['acceptsSexOffenders'],
        roomCriteria: ['isArsonSuitable', 'isWheelchairDesignated'],
        apType: 'isESAP',
      }

      expect(newPlacementSummaryList(searchStateNoNewPlacement)).toEqual(undefined)
    })
  })
})
