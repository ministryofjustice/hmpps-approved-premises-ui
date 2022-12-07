import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../../shared-examples'
import applicationFactory from '../../../../testutils/factories/application'

import ReleaseType from './releaseType'

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
        const items = new ReleaseType(
          {},
          applicationFactory.build({
            data: { 'basic-information': { 'sentence-type': { sentenceType: 'standardDeterminate' } } },
          }),
        ).items()

        expect(items.length).toEqual(4)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('hdc')
        expect(items[2].value).toEqual('license')
        expect(items[3].value).toEqual('pss')
      })

      it('if the sentence type is "extendedDeterminate" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          {},
          applicationFactory.build({
            data: { 'basic-information': { 'sentence-type': { sentenceType: 'extendedDeterminate' } } },
          }),
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
      })

      it('if the sentence type is "ipp" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          {},
          applicationFactory.build({ data: { 'basic-information': { 'sentence-type': { sentenceType: 'ipp' } } } }),
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
      })

      it('if the sentence type is "life" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          {},
          applicationFactory.build({ data: { 'basic-information': { 'sentence-type': { sentenceType: 'life' } } } }),
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
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
        [page.title]: 'Release on Temporary License (ROTL)',
      })
    })
  })
})
