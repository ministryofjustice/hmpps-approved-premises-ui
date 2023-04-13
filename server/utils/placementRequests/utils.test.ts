import { personFactory, placementRequestFactory } from '../../testutils/factories'
import { createQueryString } from '../utils'
import { formatReleaseType, mapPlacementRequestToBedSearchParams, searchButton } from './utils'
import paths from '../../paths/match'

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

      expect(searchButton(placementRequest)).toEqual(
        `<a class="govuk-button" href="${paths.beds.search({})}?${createQueryString(
          mapPlacementRequestToBedSearchParams(placementRequest),
        )}">Search</a>`,
      )
    })
  })

  describe('mapPlacementRequestToBedSearchParams', () => {
    it('transforms a placement request into bed search params', () => {
      const person = personFactory.build()
      const placementRequest = placementRequestFactory.build({
        duration: 12,
        radius: 100,
        person,
      })

      expect(mapPlacementRequestToBedSearchParams(placementRequest)).toEqual({
        durationDays: '12',
        startDate: placementRequest.expectedArrival,
        postcodeDistrict: placementRequest.location,
        maxDistanceMiles: '100',
        crn: person.crn,
        applicationId: placementRequest.applicationId,
        assessmentId: placementRequest.assessmentId,
        requiredCharacteristics: placementRequest.essentialCriteria,
      })
    })
  })
})
