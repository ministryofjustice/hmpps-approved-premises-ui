import { GovUkStatusTagColour } from '../@types/user-defined'
import HtmlUtils from './hmtlUtils'

describe('HTMLUtils', () => {
  describe('getAnchor', () => {
    it('returns a link element with given text and href', () => {
      const result = HtmlUtils.getAnchor('link text', '/path')

      expect(result).toEqual('<a href="/path">link text</a>')
    })
  })

  describe('getElementWithContent', () => {
    it('returns a div element by default', () => {
      const result = HtmlUtils.getElementWithContent('Some content')
      expect(result).toEqual('<div>Some content</div>')
    })

    it('returns any given emmet wrapped element with content', () => {
      const result = HtmlUtils.getElementWithContent('Some content', 'button')
      expect(result).toEqual('<button>Some content</button>')
    })
  })

  describe('getHiddenText', () => {
    it('returns an element with the govuk hidden class containing given content', () => {
      const result = HtmlUtils.getHiddenText('Some content')

      expect(result).toEqual('<span class="govuk-visually-hidden">Some content</span>')
    })
  })

  describe('getStatusTag', () => {
    const colours = ['grey', 'red', 'yellow']
    it.each(colours)('returns a GOV.UK Frontend status tag component with the given colour and label', colour => {
      const result = HtmlUtils.getStatusTag('Label', colour as GovUkStatusTagColour)
      expect(result).toEqual(`<strong class="govuk-tag govuk-tag--${colour}">Label</strong>`)
    })
  })
})
