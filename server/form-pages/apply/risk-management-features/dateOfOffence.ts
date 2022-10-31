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

type Response = 'current' | 'previous' | ['current', 'previous'] | undefined

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
        return { ...prev, [offence]: body[offence] as Response }
      }
      return prev
    }, {})
  }

  previous() {
    return 'convicted-offences'
  }

  next() {
    return ''
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
      return Array.isArray(formData) ? 'Current and previous' : sentenceCase(formData)
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
      this.checkbox(offence, 'current'),
      this.checkbox(offence, 'previous'),
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

  private checkbox(offence: string, date: 'current' | 'previous') {
    return this.htmlValue(
      `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="${offence}-${date}" name="${offence}" type="checkbox" value="${date}">
                <label class="govuk-label govuk-checkboxes__label" for="${offence.concat(`-${date}`)}"></label>
            </div>`,
    )
  }
}
