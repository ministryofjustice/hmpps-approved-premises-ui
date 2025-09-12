import { ReleaseTypeOption } from '@approved-premises/api'
import { getReleaseTypes } from './getReleaseTypes'
import { allReleaseTypes } from '../../utils/applications/releaseTypeUtils'

const getExpected = (set: Array<ReleaseTypeOption>): Record<ReleaseTypeOption, string> => {
  return set.reduce(
    (out, releaseType: ReleaseTypeOption) => {
      out[releaseType] = allReleaseTypes[releaseType]
      return out
    },
    {} as Record<ReleaseTypeOption, string>,
  )
}

describe('getReleaseTypes', () => {
  describe('releaseType', () => {
    it('if the sentence type is "standardDeterminate" then all the items should be shown', () => {
      expect(getReleaseTypes('standardDeterminate')).toEqual(
        getExpected(['licence', 'rotl', 'hdc', 'pss', 'paroleDirectedLicence', 'reReleasedPostRecall']),
      )
    })

    it('if the sentence type is "extendedDeterminate" then the reduced list of items should be shown', () => {
      expect(getReleaseTypes('extendedDeterminate')).toEqual(
        getExpected(['rotl', 'extendedDeterminateLicence', 'paroleDirectedLicence']),
      )
    })

    it('if the sentence type is "ipp" then the reduced list of items should be shown', () => {
      expect(getReleaseTypes('ipp')).toEqual(getExpected(['rotl', 'licence']))
    })

    it('if the sentence type is "life" then the reduced list of items should be shown', () => {
      expect(getReleaseTypes('life')).toEqual(getExpected(['rotl', 'licence']))
    })
  })
})
