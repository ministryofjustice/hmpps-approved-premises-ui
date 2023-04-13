import { placementRequestFactory } from '../../testutils/factories'
import { createQueryString } from '../utils'
import { mapPlacementRequestToBedSearchParams } from './table'
import { formatReleaseType, searchButton } from './utils'
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
})
