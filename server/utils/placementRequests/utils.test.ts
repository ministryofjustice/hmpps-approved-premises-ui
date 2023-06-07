import { personFactory, placementRequestFactory } from '../../testutils/factories'
import { assessmentLink, formatReleaseType, mapPlacementRequestToBedSearchParams, searchButton } from './utils'

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
        `<a href="/placement-requests/${placementRequest.id}/beds/search" class="govuk-button">Search</a>`,
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
        durationWeeks: '12',
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

      expect(assessmentLink(placementRequest, 'link text', 'hidden text')).toEqual(
        `<a href="/assessments/${placementRequest.assessmentId}" >link text <span class="govuk-visually-hidden">hidden text</span></a>`,
      )
    })
  })
})
