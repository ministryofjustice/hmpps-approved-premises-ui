import { cas1PlacementRequestDetailFactory, cas1SpaceBookingSummaryFactory } from '../../testutils/factories'
import {
  assessmentLink,
  formatReleaseType,
  placementRadioItems,
  placementRequestKeyDetails,
  searchButton,
  withdrawalMessage,
} from './utils'
import * as utils from '../utils'
import * as applicationHelpers from '../applications/helpers'
import paths from '../../paths/match'
import managePaths from '../../paths/manage'
import assessPaths from '../../paths/assess'
import { DateFormats } from '../dateUtils'
import { placementName } from './placementSummaryList'

describe('utils', () => {
  describe('formatReleaseType', () => {
    it('formats a release type in a human-readable format', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build({ releaseType: 'rotl' })
      expect(formatReleaseType(placementRequest)).toEqual('Release on Temporary Licence (ROTL)')
    })
  })

  describe('searchButton', () => {
    it('returns a link to the search query', () => {
      jest.spyOn(utils, 'linkTo')
      const placementRequest = cas1PlacementRequestDetailFactory.build()

      searchButton(placementRequest)

      expect(utils.linkTo).toHaveBeenCalledWith(
        paths.v2Match.placementRequests.search.spaces({ placementRequestId: placementRequest.id }),
        { text: 'Search', attributes: { class: 'govuk-button' } },
      )
    })
  })

  describe('assessmentLink', () => {
    it('returns a link to the assessment', () => {
      jest.spyOn(utils, 'linkTo')
      const placementRequest = cas1PlacementRequestDetailFactory.build()

      assessmentLink(placementRequest, 'link text', 'hidden text')

      expect(utils.linkTo).toHaveBeenCalledWith(assessPaths.assessments.show({ id: placementRequest.assessmentId }), {
        text: 'link text',
        hiddenText: 'hidden text',
      })
    })
  })

  describe('withdrawalMessage', () => {
    it('returns the message and inserts the duration and expected arrival date', () => {
      const date = '2021-01-01'
      expect(withdrawalMessage(15, date)).toEqual(
        `Request for placement for 2 weeks, 1 day starting on ${DateFormats.isoDateToUIDate(date, { format: 'short' })} withdrawn successfully`,
      )
    })
  })

  describe('placementRequestKeyDetails', () => {
    it('calls getKeyDetails with person and tier', () => {
      jest.spyOn(applicationHelpers, 'personKeyDetails')

      const placementRequest = cas1PlacementRequestDetailFactory.build()

      placementRequestKeyDetails(placementRequest)

      expect(applicationHelpers.personKeyDetails).toHaveBeenCalledWith(
        placementRequest.person,
        placementRequest.risks.tier.value.level,
      )
    })
  })

  describe('placementRadioItems', () => {
    const placement1 = cas1SpaceBookingSummaryFactory.build({
      expectedArrivalDate: '2026-01-01',
    })
    const placement2 = cas1SpaceBookingSummaryFactory.build({
      expectedArrivalDate: '2026-01-16',
    })

    it('renders a list of radio items for the given placements ordered by expected arrival date', () => {
      expect(placementRadioItems([placement2, placement1])).toEqual([
        {
          html: placementName(placement1),
          value: placement1.id,
          hint: {
            html: `<a href="${managePaths.premises.placements.show({ premisesId: placement1.premises.id, placementId: placement1.id })}" target="_blank">See placement details (opens in a new tab)</a>`,
          },
        },
        {
          html: placementName(placement2),
          value: placement2.id,
          hint: {
            html: `<a href="${managePaths.premises.placements.show({ premisesId: placement2.premises.id, placementId: placement2.id })}" target="_blank">See placement details (opens in a new tab)</a>`,
          },
        },
      ])
    })

    it('marks the correct radio item as checked', () => {
      const result = placementRadioItems([placement1, placement2], placement2.id)

      expect(result[0].checked).toBe(undefined)
      expect(result[1].checked).toBe(true)
    })
  })
})
