import { placementRequestFactory } from '../../testutils/factories'
import { mapSearchParamCharacteristicsForUi } from '../matchUtils'
import { matchingInformationSummary, placementRequirementsRow } from './matchingInformationSummaryList'

describe('matchingInformationSummaryList', () => {
  describe('matchingInformationSummary', () => {
    it('should return a summary of the matching information', () => {
      const placementRequest = placementRequestFactory.build()

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [
          placementRequirementsRow(placementRequest, 'essential'),
          placementRequirementsRow(placementRequest, 'desirable'),
        ],
      })
    })

    it('should add notes if provided', () => {
      const placementRequest = placementRequestFactory.build({ notes: 'Some notes' })

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [
          placementRequirementsRow(placementRequest, 'essential'),
          placementRequirementsRow(placementRequest, 'desirable'),
          {
            key: {
              text: 'Observations from assessor',
            },
            value: {
              text: placementRequest.notes,
            },
          },
        ],
      })
    })
  })

  describe('placementRequirementsRow', () => {
    it('returns a list of desirable placement requirements in sentence case', () => {
      const placementRequest = placementRequestFactory.build()

      expect(placementRequirementsRow(placementRequest, 'desirable')).toEqual({
        key: {
          text: `Desirable Criteria`,
        },
        value: {
          html: mapSearchParamCharacteristicsForUi(placementRequest.desirableCriteria),
        },
      })
    })
  })

  describe('placementRequirementsRow', () => {
    it('returns a list of essential placement requirements in sentence case', () => {
      const placementRequest = placementRequestFactory.build()

      expect(placementRequirementsRow(placementRequest, 'essential')).toEqual({
        key: {
          text: `Essential Criteria`,
        },
        value: {
          html: mapSearchParamCharacteristicsForUi(placementRequest.essentialCriteria),
        },
      })
    })
  })
})
