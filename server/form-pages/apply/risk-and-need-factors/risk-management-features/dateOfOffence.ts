import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { lowerCase, sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'

const offences = {
  hateCrime: 'Hate crime',
  nonSexualOffencesAgainstChildren: 'Non-sexual offences against children',
  contactSexualOffencesAgainstAdults: 'Contact sexual offences against adults',
  nonContactSexualOffencesAgainstAdults: 'Non-contact sexual offences against adults',
  contactSexualOffencesAgainstChildren: 'Contact sexual offences against children',
  nonContactSexualOffencesAgainstChildren: 'Non-contact sexual offences against children',
} as const

const offencesList = Object.keys(offences)

type Offence = keyof typeof offences

type Response = ReadonlyArray<'previous' | 'current'> | 'previous' | 'current'

@Page({ name: 'date-of-offence', bodyProperties: Object.keys(offences) })
export default class DateOfOffence implements TasklistPage {
  title = `Convicted offences`

  questions = {
    currentOrPrevious: 'Is the offence a current or previous offence?',
  }

  constructor(private _body: Partial<Record<Offence, Response>>) {}

  public get body(): Partial<Record<Offence, Response>> {
    return this._body
  }

  public set body(value: Partial<Record<Offence, Response>>) {
    this._body = offencesList.reduce((prev, offence) => {
      if (value[offence]) {
        return { ...prev, [offence]: [value[offence]].flat() as Response }
      }
      return prev
    }, {})
  }

  previous() {
    return 'convicted-offences'
  }

  next() {
    return 'rehabilitative-interventions'
  }

  response() {
    return offencesList.reduce(
      (prev, curr) => ({
        ...prev,
        [`Is the ${lowerCase(curr)} current or previous?`]: this.getPlainEnglishAnswerFromFormData(this.body[curr]),
      }),
      {},
    )
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
      errors.hateCrime = 'You must enter a time period for one or more offence'
    }

    return errors
  }

  renderTableHead() {
    return ['Offence', 'Current', 'Previous'].map(headerItem => this.textValue(headerItem))
  }

  renderTableRow(offence: string) {
    return [
      this.textValue(sentenceCase(offence)),
      DateOfOffence.checkbox(offence, 'current', this.isSelected(offence, 'current')),
      DateOfOffence.checkbox(offence, 'previous', this.isSelected(offence, 'previous')),
    ]
  }

  renderTableBody() {
    return Object.keys(offences).map(offence => this.renderTableRow(offence))
  }

  static checkbox(offence: string, date: 'current' | 'previous', checked: boolean) {
    const id = `${offence}-${date}`

    return this.htmlValue(
      `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
          <div class="govuk-checkboxes__item">
          <input class="govuk-checkboxes__input" id="${id}" name="${offence}" type="checkbox" value="${date}" ${
            checked ? 'checked' : ''
          }>
              <label class="govuk-label govuk-checkboxes__label" for="${id}">
                <span class="govuk-visually-hidden">${sentenceCase(offence)}: ${date}</span>
              </label>
          </div>
        </div>`,
    )
  }

  private textValue(value: string) {
    return { text: value }
  }

  private static htmlValue(value: string) {
    return { html: value }
  }

  private isSelected(offence: string, timePeriod: string) {
    return Boolean(this?.body?.[offence]?.find((item: string) => item === timePeriod))
  }
}
