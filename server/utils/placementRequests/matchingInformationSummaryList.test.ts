import { placementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import {
  mapSearchParamCharacteristicsForUi,
  matchingInformationSummary,
  placementRequirementsRow,
  preferredApsRow,
} from './matchingInformationSummaryList'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import { HtmlItem, SummaryListItem } from '../../@types/ui'

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

  describe('mapSearchParamCharacteristicsForUi', () => {
    it('it returns the search results characteristics names in a list', () => {
      expect(mapSearchParamCharacteristicsForUi(['isPIPE'])).toEqual(
        '<ul class="govuk-list"><li>Psychologically Informed Planned Environment (PIPE)</li></ul>',
      )
    })
  })

  describe('placementRequirementsRow', () => {
    it('returns a list of desirable placement requirements in sentence case', () => {
      const placementRequest = placementRequestDetailFactory.build()

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
      const placementRequest = placementRequestDetailFactory.build()

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

  describe('preferredApsRow', () => {
    const placementRequest = placementRequestDetailFactory.build()

    it('should return undefined if there are no preferred APs', () => {
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue([])

      expect(preferredApsRow(placementRequest)).toEqual(undefined)
    })

    it('should return a list of premises if there are preferred APs', () => {
      const premises = premisesFactory.buildList(4)
      ;(getPreferredApsFromApplication as jest.Mock).mockReturnValue(premises)

      const row = preferredApsRow(placementRequest) as SummaryListItem

      expect(row.key).toEqual({ text: 'Preferred APs' })
      expect((row.value as HtmlItem).html).toMatchStringIgnoringWhitespace(`
      <ol class="govuk-list govuk-list--number">
        <li>${premises[0].name}</li>
        <li>${premises[1].name}</li>
        <li>${premises[2].name}</li>
        <li>${premises[3].name}</li>
      </ol>
      `)
    })
  })
})
