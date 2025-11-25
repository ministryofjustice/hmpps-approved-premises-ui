import { adjacentPageFromSentenceType } from '../../utils/applications/adjacentPageFromSentenceType'
import { itShouldHavePreviousValue } from './index'

import SentenceType from './sentenceType'

jest.mock('../../utils/applications/adjacentPageFromSentenceType')

describe('SentenceType', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new SentenceType({ sentenceType: 'standardDeterminate' })

      expect(page.body).toEqual({ sentenceType: 'standardDeterminate' })
    })
  })

  describe('next', () => {
    it('calls selectAdjacentPageFromSentenceType and returns the result', () => {
      ;(adjacentPageFromSentenceType as jest.MockedFn<typeof adjacentPageFromSentenceType>).mockReturnValue(
        'release-type',
      )

      const result = new SentenceType({ sentenceType: 'standardDeterminate' }).next()

      expect(result).toEqual('release-type')
      expect(adjacentPageFromSentenceType).toHaveBeenCalledWith('standardDeterminate')
    })
  })

  itShouldHavePreviousValue(new SentenceType({}), 'relevant-dates')

  describe('errors', () => {
    it('should return an empty object if the sentence type is populated', () => {
      const page = new SentenceType({ sentenceType: 'life' })
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the sentence type is not populated', () => {
      const page = new SentenceType({})
      expect(page.errors()).toEqual({ sentenceType: 'You must choose a sentence type' })
    })
  })

  describe('items', () => {
    it('marks an option as selected when the sentenceType is set', () => {
      const page = new SentenceType({ sentenceType: 'life' })

      const selectedOptions = page.items('conditionalHTML').filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('life')
    })

    it('marks no options selected when the sentenceType is not set', () => {
      const page = new SentenceType({})

      const selectedOptions = page.items('conditionalHTML').filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })

    it('returns the conditional text for the nonStatutory key', () => {
      const page = new SentenceType({})

      const selectedOptions = page.items('conditionalHTML')

      selectedOptions.forEach(item => {
        if (item.value !== 'nonStatutory') {
          expect(item.conditional).toEqual({ html: '' })
        } else {
          expect(item.conditional).toEqual({ html: 'conditionalHTML' })
        }
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SentenceType({ sentenceType: 'life' })

      expect(page.response()).toEqual({ [page.title]: 'Life sentence' })
    })
  })
})
