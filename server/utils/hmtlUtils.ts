import { GovUkStatusTagColour } from '../@types/user-defined'

export default class HtmlUtils {
  static getAnchor(text: string, href: string): string {
    return `<a href="${href}">${text}</a>`
  }

  static getElementWithContent(text: string, element: string = 'div'): string {
    return `<${element}>${text}</${element}>`
  }

  static getHiddenText = (text: string): string => {
    return `<span class="govuk-visually-hidden">${text}</span>`
  }

  static getStatusTag = (statusLabel: string, colour: GovUkStatusTagColour): string => {
    return `<strong class="govuk-tag govuk-tag--${colour}">${statusLabel}</strong>`
  }
}
