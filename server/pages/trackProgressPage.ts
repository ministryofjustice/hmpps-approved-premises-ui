import { ParsedQs } from 'qs'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import { ValidationErrors } from '../@types/user-defined'

export type TrackProgressPageInput = {
  team: string
  startDate: string
  'startDate-day': string
  'startDate-month': string
  'startDate-year': string
  endDate: string
  'endDate-day': string
  'endDate-month': string
  'endDate-year': string
}

export default class TrackProgressPage {
  private query: ParsedQs

  constructor(query: ParsedQs) {
    this.query = query
  }

  validationErrors() {
    const validationErrors: ValidationErrors<TrackProgressPageInput> = {}

    if (!this.query.team) {
      validationErrors.team = { text: 'Choose a team' }
    }

    if (!this.query['startDate-day'] || !this.query['startDate-month'] || !this.query['startDate-year']) {
      validationErrors['startDate-day'] = { text: 'Include the start date' }
    }

    if (!this.query['endDate-day'] || !this.query['endDate-month'] || !this.query['endDate-year']) {
      validationErrors['endDate-day'] = { text: 'Include the end date' }
    }

    return validationErrors
  }

  items() {
    const errors = this.validationErrors()

    const startDateInput = new GovukFrontendDateInput(this.query, 'startDate', Boolean(errors?.['startDate-day']))
    const endDateInput = new GovukFrontendDateInput(this.query, 'endDate', Boolean(errors?.['endDate-day']))

    return {
      startDateItems: startDateInput.items,
      endDateItems: endDateInput.items,
    }
  }
}
