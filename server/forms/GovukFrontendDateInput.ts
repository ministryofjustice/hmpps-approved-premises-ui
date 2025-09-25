import { ParsedQs } from 'qs'

type GovukFrontendDateInputPartType = 'day' | 'month' | 'year'

interface GovUkFrontendDateInputItem {
  name: string
  classes: string
  value: string
}

export default class GovukFrontendDateInput {
  items: GovUkFrontendDateInputItem[]

  private dayValue: string

  private monthValue: string

  private yearValue: string

  constructor(query: ParsedQs, key: string) {
    this.dayValue = GovukFrontendDateInput.getDatePartQueryValue(query, key, 'day')
    this.monthValue = GovukFrontendDateInput.getDatePartQueryValue(query, key, 'month')
    this.yearValue = GovukFrontendDateInput.getDatePartQueryValue(query, key, 'year')

    this.buildItems()
  }

  private buildItems(): void {
    this.items = [
      {
        name: 'day',
        classes: 'govuk-input--width-2',
        value: this.dayValue,
      },
      {
        name: 'month',
        classes: 'govuk-input--width-2',
        value: this.monthValue,
      },
      {
        name: 'year',
        classes: 'govuk-input--width-4',
        value: this.yearValue,
      },
    ]
  }

  static getDatePartQueryValue(query: ParsedQs, key: string, type: GovukFrontendDateInputPartType): string {
    const value = query[`${key}-${type}`]

    return value === undefined ? '' : value.toString()
  }
}
