import { applicationFactory } from '../../../../testutils/factories'
import { adjacentPageFromSentenceType } from '../../../../utils/applications/adjacentPageFromSentenceType'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import SentenceType from './sentenceType'

jest.mock('../../../../utils/applications/adjacentPageFromSentenceType')

describe('SentenceType', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new SentenceType({ sentenceType: 'standardDeterminate' }, application)

      expect(page.body).toEqual({ sentenceType: 'standardDeterminate' })
    })
  })

  describe('next', () => {
    it('calls selectAdjacentPageFromSentenceType and returns the result', () => {
      ;(adjacentPageFromSentenceType as jest.MockedFn<typeof adjacentPageFromSentenceType>).mockReturnValue(
        'release-type',
      )

      const result = new SentenceType({ sentenceType: 'standardDeterminate' }, application).next()

      expect(result).toEqual('release-type')
      expect(adjacentPageFromSentenceType).toHaveBeenCalledWith('standardDeterminate')
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
