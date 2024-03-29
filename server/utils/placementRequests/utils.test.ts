import { personFactory, placementRequestFactory } from '../../testutils/factories'
import {
  assessmentLink,
  formatReleaseType,
  mapPlacementRequestToBedSearchParams,
  placementRequestTabItems,
  searchButton,
  withdrawalMessage,
} from './utils'
import { linkTo } from '../utils'
import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { DateFormats } from '../dateUtils'

jest.mock('../utils')

describe('utils', () => {
  describe('formatReleaseType', () => {
    it('formats a release type in a human-readable format', () => {
      const placementRequest = placementRequestFactory.build({ releaseType: 'rotl' })
      expect(formatReleaseType(placementRequest)).toEqual('Release on Temporary Licence (ROTL)')
    })
  })

  describe('searchButton', () => {
    it('returns a link to the search query', () => {
      const placementRequest = placementRequestFactory.build()

      searchButton(placementRequest)

      expect(linkTo).toHaveBeenCalledWith(
        paths.placementRequests.beds.search,
        { id: placementRequest.id },
        { text: 'Search', attributes: { class: 'govuk-button' } },
      )
    })
  })

  describe('mapPlacementRequestToBedSearchParams', () => {
    it('transforms a placement request into bed search params', () => {
      const person = personFactory.build()
      const placementRequest = placementRequestFactory.build({
        duration: 15,
        radius: 100,
        person,
      })

      expect(mapPlacementRequestToBedSearchParams(placementRequest)).toEqual({
        durationWeeks: '2',
        durationDays: '1',
        startDate: placementRequest.expectedArrival,
        postcodeDistrict: placementRequest.location,
        maxDistanceMiles: '100',
        crn: person.crn,
        applicationId: placementRequest.applicationId,
        assessmentId: placementRequest.assessmentId,
        requiredCharacteristics: [...placementRequest.essentialCriteria, ...placementRequest.desirableCriteria],
      })
    })
  })

  describe('assessmentLink', () => {
    it('returns a link to the assessment', () => {
      const placementRequest = placementRequestFactory.build()

      assessmentLink(placementRequest, 'link text', 'hidden text')

      expect(linkTo).toHaveBeenCalledWith(
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
          active: true,
          href: '/admin/placement-requests?',
          text: 'Ready to match',
        },
        {
          active: false,
          href: '/admin/placement-requests?status=unableToMatch&',
          text: 'Unable to match',
        },
        {
          active: false,
          href: '/admin/placement-requests?status=matched&',
          text: 'Matched',
        },
        {
          active: false,
          href: '/admin/placement-requests/search',
          text: 'Search',
        },
      ])
    })
  })
})
