import { ReleaseTypeOption } from '@approved-premises/api'
import { applicationFactory, placementApplicationFactory } from '../../testutils/factories'
import ReleaseType from './releaseType'
import { allReleaseTypes } from '../../utils/applications/releaseTypeUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from './index'

const getExpected = (set: Array<ReleaseTypeOption>): Record<ReleaseTypeOption, string> => {
  return set.reduce(
    (out, releaseType: ReleaseTypeOption) => {
      out[releaseType] = allReleaseTypes[releaseType]
      return out
    },
    {} as Record<ReleaseTypeOption, string>,
  )
}

jest.mock('../../utils/retrieveQuestionResponseFromFormArtifact', () => {
  return { retrieveQuestionResponseFromFormArtifact: jest.fn(() => 'standardDeterminate') }
})

describe('ReleaseType', () => {
  const application = applicationFactory.build({
    data: { 'basic-information': { 'sentence-type': { sentenceType: 'standardDeterminate' } } },
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, application)

      expect(page.body).toEqual({ releaseType: 'rotl' })
    })
  })

  itShouldHavePreviousValue(new ReleaseType({}, application), 'sentence-type')
  itShouldHaveNextValue(new ReleaseType({}, application), 'release-date')

  describe('errors', () => {
    it('should return an empty object if the release type is populated', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the release type is not populated', () => {
      const page = new ReleaseType({}, application)
      expect(page.errors()).toEqual({ releaseType: 'You must choose a release type' })
    })
  })

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
        expect(releaseType.getReleaseTypes()).toEqual(getExpected(['rotl', 'paroleDirectedLicence']))
      })

      it('if the sentence type is "life" then the reduced list of items should be shown', () => {
        releaseType.sentenceType = 'life'
        expect(releaseType.getReleaseTypes()).toEqual(getExpected(['rotl', 'paroleDirectedLicence']))
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Release on Temporary Licence (ROTL)',
      })
    })
  })
})
