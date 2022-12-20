import type { TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { SessionDataError } from '../../../utils/errors'
import { DateFormats } from '../../../utils/dateUtils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

type PlacementDurationBody = {
  duration: string
  durationDetail: string
}

@Page({ name: 'placement-duration', bodyProperties: ['duration', 'durationDetail'] })
export default class PlacementDuration implements TasklistPage {
  title = 'Placement duration and move on'

  arrivalDate: Date = this.fetchArrivalDate()

  questions = {
    duration: 'What duration of placement do you recommend?',
    durationDetail: 'Provide any additional information',
  }

  constructor(public body: Partial<PlacementDurationBody>, private readonly application: ApprovedPremisesApplication) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return 'relocation-region'
  }

  response() {
    const response = {
      [this.questions.duration]: `${this.body.duration} weeks`,
    }

    if (this.body.durationDetail) {
      response[this.questions.durationDetail] = this.body.durationDetail
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.duration) {
      errors.duration = 'You must specify the duration of the placement'
    }

    return errors
  }

  private fetchArrivalDate(): Date {
    try {
      const basicInformation = this.application.data['basic-information']

      if (!basicInformation) throw new SessionDataError('No basic information')

      const placementDate = basicInformation['placement-date']

      if (!placementDate) throw new SessionDataError('No placement date')

      if (placementDate.startDateSameAsReleaseDate === 'yes') {
        const releaseDate = basicInformation['release-date']

        if (!releaseDate) throw new SessionDataError('No release date')

        return DateFormats.isoToDateObj(releaseDate.releaseDate)
      }

      return DateFormats.isoToDateObj(placementDate.startDate)
    } catch (e) {
      throw new SessionDataError(`Move on information placement duration error: ${e}`)
    }
  }
}
