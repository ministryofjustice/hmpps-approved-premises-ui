import { placementRequestFactory } from '../../testutils/factories'
import { assessmentLink, formatReleaseType, placementRequestTabItems, searchButton, withdrawalMessage } from './utils'
import * as utils from '../utils'
import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { DateFormats } from '../dateUtils'

describe('utils', () => {
  describe('formatReleaseType', () => {
    it('formats a release type in a human-readable format', () => {
      const placementRequest = placementRequestFactory.build({ releaseType: 'rotl' })
      expect(formatReleaseType(placementRequest)).toEqual('Release on Temporary Licence (ROTL)')
    })
  })

  describe('searchButton', () => {
    it('returns a link to the search query', () => {
      jest.spyOn(utils, 'linkTo')
      const placementRequest = placementRequestFactory.build()

      searchButton(placementRequest)

      expect(utils.linkTo).toHaveBeenCalledWith(
        paths.v2Match.placementRequests.search.spaces,
        { id: placementRequest.id },
        { text: 'Search', attributes: { class: 'govuk-button' } },
      )
    })
  })

  describe('assessmentLink', () => {
    it('returns a link to the assessment', () => {
      jest.spyOn(utils, 'linkTo')
      const placementRequest = placementRequestFactory.build()

      assessmentLink(placementRequest, 'link text', 'hidden text')

      expect(utils.linkTo).toHaveBeenCalledWith(
        assessPaths.assessments.show,
        { id: placementRequest.assessmentId },
        { text: 'link text', hiddenText: 'hidden text' },
      )
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

  describe('placementRequestTabItems', () => {
    it('returns placement request tab items', () => {
      expect(placementRequestTabItems('notMatched', 'apArea', 'parole')).toEqual([
        {
          active: false,
          text: 'Pending Request for Placement',
          href: `/admin/cru-dashboard?apArea=apArea&status=pendingPlacement`,
        },
        {
          active: true,
          href: '/admin/cru-dashboard?apArea=apArea&requestType=parole',
          text: 'Ready to match',
        },
        {
          active: false,
          href: '/admin/cru-dashboard?apArea=apArea&requestType=parole&status=unableToMatch',
          text: 'Unable to match',
        },
        {
          active: false,
          href: '/admin/cru-dashboard?apArea=apArea&requestType=parole&status=matched',
          text: 'Matched',
        },
        {
          active: false,
          href: '/admin/cru-dashboard/search',
          text: 'Search',
        },
      ])
    })
  })
})
