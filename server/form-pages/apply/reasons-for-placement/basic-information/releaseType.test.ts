import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { applicationFactory } from '../../../../testutils/factories'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

import ReleaseType from './releaseType'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact', () => {
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

  describe('items', () => {
    describe('releaseType', () => {
      it('if the sentence type is "standardDeterminate" then all the items should be shown', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('standardDeterminate')

        const items = new ReleaseType({}, application).items()

        expect(new Set(items.map(item => item.value))).toEqual(
          new Set(['licence', 'rotl', 'hdc', 'pss', 'paroleDirectedLicence']),
        )
      })

      it('if the sentence type is "extendedDeterminate" then the reduced list of items should be shown', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('extendedDeterminate')

        const items = new ReleaseType({}, application).items()

        expect(new Set(items.map(item => item.value))).toEqual(
          new Set(['rotl', 'extendedDeterminateLicence', 'paroleDirectedLicence']),
        )
      })

      it('if the sentence type is "ipp" then the reduced list of items should be shown', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('ipp')

        const items = new ReleaseType({}, application).items()

        expect(new Set(items.map(item => item.value))).toEqual(new Set(['rotl', 'licence']))
      })

      it('if the sentence type is "life" then the reduced list of items should be shown', () => {
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('life')

        const items = new ReleaseType({}, application).items()

        expect(new Set(items.map(item => item.value))).toEqual(new Set(['rotl', 'licence']))
      })
    })

    it('marks an option as selected when the releaseType is set', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('rotl')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new ReleaseType({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
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
