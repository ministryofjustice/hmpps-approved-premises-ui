import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { assessmentLink, formatReleaseType, placementRequestKeyDetails, searchButton, withdrawalMessage } from './utils'
import * as utils from '../utils'
import * as applicationHelpers from '../applications/helpers'
import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { DateFormats } from '../dateUtils'

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
})
