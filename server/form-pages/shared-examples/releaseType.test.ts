import { ReleaseTypeOption } from '@approved-premises/api'
import { placementApplicationFactory } from '../../testutils/factories'
import ReleaseType from './releaseType'
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

describe('ReleaseType.getReleaseTypes', () => {
  const releaseType = new ReleaseType({}, placementApplicationFactory.build())

  describe('releaseType', () => {
    it('if the sentence type is "standardDeterminate" then all the items should be shown', () => {
      releaseType.sentenceType = 'standardDeterminate'
      expect(releaseType.getReleaseTypes()).toEqual(
        getExpected(['licence', 'rotl', 'hdc', 'pss', 'paroleDirectedLicence', 'reReleasedPostRecall']),
      )
    })

    it('if the sentence type is "extendedDeterminate" then the reduced list of items should be shown', () => {
      releaseType.sentenceType = 'extendedDeterminate'
      expect(releaseType.getReleaseTypes()).toEqual(
        getExpected(['rotl', 'extendedDeterminateLicence', 'paroleDirectedLicence']),
      )
    })

    it('if the sentence type is "ipp" then the reduced list of items should be shown', () => {
      releaseType.sentenceType = 'ipp'
      expect(releaseType.getReleaseTypes()).toEqual(getExpected(['rotl', 'licence']))
    })

    it('if the sentence type is "life" then the reduced list of items should be shown', () => {
      releaseType.sentenceType = 'life'
      expect(releaseType.getReleaseTypes()).toEqual(getExpected(['rotl', 'licence']))
    })
  })
})
