import { addDays, weeksToDays } from 'date-fns'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { SessionDataError } from '../../../utils/errors'
import { DateFormats } from '../../../utils/dateUtils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { sentenceCase } from '../../../utils/utils'
import { getDefaultPlacementDurationInWeeks } from '../../../utils/applications/getDefaultPlacementDurationInWeeks'

type PlacementDurationBody = {
  differentDuration: YesOrNo
  durationDays?: string
  durationWeeks?: string
  duration?: string
  reason?: string
}

@Page({
  name: 'placement-duration',
  bodyProperties: ['differentDuration', 'duration', 'durationDays', 'durationWeeks', 'reason'],
})
export default class PlacementDuration implements TasklistPage {
  title = 'Placement duration and move on'

  arrivalDate: Date = this.fetchArrivalDate()

  departureDate: Date = this.fetchDepartureDate()

  questions = {
    differentDuration: 'Does this application require a different placement duration?',
    duration: 'How many weeks will the person stay at the AP?',
    reason: 'Why does this person require a different placement duration?',
  }

  constructor(public body: Partial<PlacementDurationBody>, private readonly application: ApprovedPremisesApplication) {
    this.body.duration = this.lengthInDays()
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'relocation-region'
  }

  response() {
    const response = {}

    response[this.questions.differentDuration] = sentenceCase(this.body.differentDuration)

    if (this.body.differentDuration === 'yes') {
      response[this.questions.duration] = sentenceCase(
        `${DateFormats.formatDuration({ weeks: this.body.durationWeeks, days: this.body.durationDays })}`,
      )
      response[this.questions.reason] = this.body.reason
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.differentDuration) {
      errors.differentDuration = 'You must specify if this application requires a different placement length'
    }

    if (this.body.differentDuration === 'yes') {
      if (!this.body.durationDays) {
        errors.duration = 'You must specify the duration of the placement'
      }

      if (!this.body.durationWeeks) {
        errors.duration = 'You must specify the duration of the placement'
      }

      if (!this.body.reason) {
        errors.reason = 'You must specify the reason for the different placement duration'
      }
    }

    return errors
  }

  private lengthInDays(): string {
    if (this.body.differentDuration === 'yes' && this.body.durationDays && this.body.durationWeeks) {
      return String(weeksToDays(Number(this.body.durationWeeks)) + Number(this.body.durationDays))
    }

    return undefined
  }

  private fetchArrivalDate(): Date {
    try {
      const basicInformation = this.application.data['basic-information']

      if (!basicInformation) throw new SessionDataError('No basic information')

      const placementDate = basicInformation['placement-date']

      if (!placementDate) return undefined

      if (placementDate && placementDate.startDateSameAsReleaseDate === 'yes') {
        const releaseDate = basicInformation['release-date']

        if (!releaseDate) return undefined

        return DateFormats.isoToDateObj(releaseDate.releaseDate)
      }

      return placementDate?.startDate ? DateFormats.isoToDateObj(placementDate.startDate) : undefined
    } catch (e) {
      throw new SessionDataError(`Move on information placement duration error: ${e}`)
    }
  }

  private fetchDepartureDate(): Date | null {
    const standardPlacementDuration = getDefaultPlacementDurationInWeeks(this.application)

    return this.arrivalDate ? addDays(this.arrivalDate, 7 * standardPlacementDuration) : null
  }
}
