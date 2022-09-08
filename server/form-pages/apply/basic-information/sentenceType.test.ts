import { itShouldHavePreviousValue } from '../../shared-examples'

import SentenceType from './sentenceType'

describe('SentenceType', () => {
  itShouldHavePreviousValue(new SentenceType({}), 'confirm-details')

  describe('next', () => {
    it('should return release-type for a standardDeterminate sentence', () => {
      const page = new SentenceType({ sentenceType: 'standardDeterminate' })
      expect(page.next()).toEqual('release-type')
    })

    it('should return situation for a communityOrder sentence', () => {
      const page = new SentenceType({ sentenceType: 'communityOrder' })
      expect(page.next()).toEqual('situation')
    })

    it('should return situation for a bailPlacement sentence', () => {
      const page = new SentenceType({ sentenceType: 'bailPlacement' })
      expect(page.next()).toEqual('situation')
    })

    it('should return release-type for an extendedDeterminate sentence', () => {
      const page = new SentenceType({ sentenceType: 'extendedDeterminate' })
      expect(page.next()).toEqual('release-type')
    })

    it('should return release-type for an ipp sentence', () => {
      const page = new SentenceType({ sentenceType: 'ipp' })
      expect(page.next()).toEqual('release-type')
    })

    it('should return release-type for a life sentence', () => {
      const page = new SentenceType({ sentenceType: 'life' })
      expect(page.next()).toEqual('release-type')
    })

    it('should throw an error if the sentence is not expected', () => {
      const page = new SentenceType({ sentenceType: 'foo' })

      expect(() => page.next()).toThrowError()
    })
  })

  describe('errors', () => {
    it('should return an empty array if the sentence type is populated', () => {
      const page = new SentenceType({ sentenceType: 'life' })
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the sentence type is not populated', () => {
      const page = new SentenceType({ sentenceType: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: 'sentenceType',
          errorType: 'blank',
        },
      ])
    })
  })

  describe('items', () => {
    it('marks an option as selected when the sentenceType is set', () => {
      const page = new SentenceType({ sentenceType: 'life' })

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('life')
    })

    it('marks no options selected when the sentenceType is not set', () => {
      const page = new SentenceType({})

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
