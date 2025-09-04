import { cas1PlacementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import { matchingInformationSummary } from './matchingInformationSummaryList'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import { preferredApsRow } from './preferredApsRow'
import { placementRequirementsRow } from './placementRequirementsRow'

jest.mock('./getPreferredApsFromApplication')

describe('matchingInformationSummaryList', () => {
  describe('matchingInformationSummary', () => {
    it('should return a summary of the matching information', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])
      const placementRequest = cas1PlacementRequestDetailFactory.build({ notes: undefined })

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [placementRequirementsRow(placementRequest)],
      })
    })

    it('should add notes if provided', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])

      const placementRequest = cas1PlacementRequestDetailFactory.build({ notes: 'Some notes' })

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [
          placementRequirementsRow(placementRequest),
          {
            key: {
              text: 'Observations from assessor',
            },
            value: {
              html: '<span class="govuk-summary-list__textblock">Some notes</span>',
            },
          },
        ],
      })
    })

    it('should add preferred APs if provided', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue(premisesFactory.buildList(4))
      const placementRequest = cas1PlacementRequestDetailFactory.build({ notes: undefined })

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [preferredApsRow(placementRequest), placementRequirementsRow(placementRequest)],
      })
    })
  })
})
