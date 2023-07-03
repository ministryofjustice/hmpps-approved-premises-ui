import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import SentenceType from './sentenceType'

describe('SentenceType', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new SentenceType({ sentenceType: 'standardDeterminate' }, application)

      expect(page.body).toEqual({ sentenceType: 'standardDeterminate' })
    })
  })

  describe('next', () => {
    it('should return release-type for a standardDeterminate sentence', () => {
      const page = new SentenceType({ sentenceType: 'standardDeterminate' }, application)
      expect(page.next()).toEqual('release-type')
    })

    it('should return situation for a communityOrder sentence', () => {
      const page = new SentenceType({ sentenceType: 'communityOrder' }, application)
      expect(page.next()).toEqual('situation')
    })

    it('should return situation for a bailPlacement sentence', () => {
      const page = new SentenceType({ sentenceType: 'bailPlacement' }, application)
      expect(page.next()).toEqual('situation')
    })

    it('should return release-type for an extendedDeterminate sentence', () => {
      const page = new SentenceType({ sentenceType: 'extendedDeterminate' }, application)
      expect(page.next()).toEqual('release-type')
    })

    it('should return release-type for an ipp sentence', () => {
      const page = new SentenceType({ sentenceType: 'ipp' }, application)
      expect(page.next()).toEqual('release-type')
    })

    it('should return release-type for a life sentence', () => {
      const page = new SentenceType({ sentenceType: 'life' }, application)
      expect(page.next()).toEqual('release-type')
    })

    it('should return release-date for a non-statutory / MAPPA sentence', () => {
      const page = new SentenceType({ sentenceType: 'nonStatutory' }, application)
      expect(page.next()).toEqual('release-date')
    })
  })

  itShouldHavePreviousValue(new SentenceType({}, application), 'end-dates')

  describe('errors', () => {
    it('should return an empty object if the sentence type is populated', () => {
      const page = new SentenceType({ sentenceType: 'life' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the sentence type is not populated', () => {
      const page = new SentenceType({}, application)
      expect(page.errors()).toEqual({ sentenceType: 'You must choose a sentence type' })
    })
  })

  describe('items', () => {
    it('marks an option as selected when the sentenceType is set', () => {
      const page = new SentenceType({ sentenceType: 'life' }, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('life')
    })

    it('marks no options selected when the sentenceType is not set', () => {
      const page = new SentenceType({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SentenceType({ sentenceType: 'life' }, application)

      expect(page.response()).toEqual({ [page.title]: 'Life sentence' })
    })
  })
})
