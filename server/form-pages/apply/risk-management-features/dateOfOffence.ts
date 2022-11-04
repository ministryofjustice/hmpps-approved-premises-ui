import type { TaskListErrors } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

const offences = {
  arsonOffence: 'Arson offence',
  hateCrime: 'Hate crime',
  inPersonSexualOffence: 'Child sexual offence, in person',
  onlineSexualOffence: 'Online sexual offence',
} as const

const offencesList = Object.keys(offences)

type Offence = keyof typeof offences

type Response = ['current'] | ['previous'] | ['current', 'previous']

export default class DateOfOffence implements TasklistPage {
  name = 'date-of-offence'

  title = `Date of convicted offences`

  body: Record<Offence, Response> | Record<string, never>

  questions = {
    currentOrPrevious: 'Is the offence a current or previous offence?',
  }

  constructor(body: Record<string, unknown>) {
    this.body = offencesList.reduce((prev, offence) => {
      if (body[offence]) {
        return { ...prev, [offence]: [body[offence]].flat() as Response }
      }
      return prev
    }, {})
  }

  previous() {
    return 'type-of-convicted-offence'
  }

  next() {
    return 'rehabilitative-interventions'
  }

  response() {
    return {
      [this.title]: {
        [this.questions.currentOrPrevious]: offencesList.reduce(
          (prev, curr) => ({ ...prev, [sentenceCase(curr)]: this.getPlainEnglishAnswerFromFormData(this.body[curr]) }),
          {},
        ),
      },
    }
  }

  getPlainEnglishAnswerFromFormData(formData: Response) {
    if (formData) {
      return formData.length === 2 ? 'Current and previous' : sentenceCase(formData[0])
    }
    return 'Neither'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!Object.keys(this.body).find(key => !!this.body[key])) {
      errors.arsonOffence = 'You must enter a time period for one or more offence'
    }

    return errors
  }

  renderTableHead() {
    return ['Offence', 'Current', 'Previous'].map(headerItem => this.textValue(headerItem))
  }

  renderTableRow(offence: string) {
    return [
      this.textValue(sentenceCase(offence)),
      this.checkbox(offence, 'current', this.isSelected(offence, 'current')),
      this.checkbox(offence, 'previous', this.isSelected(offence, 'previous')),
    ]
  }

  renderTableBody() {
    return Object.keys(offences).map(offence => this.renderTableRow(offence))
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private checkbox(offence: string, date: 'current' | 'previous', checked: boolean) {
    return this.htmlValue(
      `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="${offence}-${date}" name="${offence}" type="checkbox" value="${date}" ${
        checked ? 'checked' : ''
      }>
                <label class="govuk-label govuk-checkboxes__label" for="${offence.concat(`-${date}`)}"></label>
            </div>`,
    )
  }

  private isSelected(offence: string, timePeriod: string) {
    return Boolean(this?.body?.[offence]?.find((item: string) => item === timePeriod))
  }
}
