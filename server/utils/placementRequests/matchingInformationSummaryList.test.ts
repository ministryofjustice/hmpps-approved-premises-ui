import { placementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import { matchingInformationSummary } from './matchingInformationSummaryList'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import { preferredApsRow } from './preferredApsRow'
import { placementRequirementsRow } from './placementRequirementsRow'

jest.mock('./getPreferredApsFromApplication')

describe('matchingInformationSummaryList', () => {
  describe('matchingInformationSummary', () => {
    it('should return a summary of the matching information', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])
      const placementRequest = placementRequestDetailFactory.build({ notes: undefined })

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
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])

      const placementRequest = placementRequestDetailFactory.build({ notes: 'Some notes' })

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

    it('should add preferred APs if provided', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue(premisesFactory.buildList(4))
      const placementRequest = placementRequestDetailFactory.build({ notes: undefined })

      expect(matchingInformationSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Information for Matching',
          },
        },
        rows: [
          preferredApsRow(placementRequest),
          placementRequirementsRow(placementRequest, 'essential'),
          placementRequirementsRow(placementRequest, 'desirable'),
        ],
      })
    })
  })
})
