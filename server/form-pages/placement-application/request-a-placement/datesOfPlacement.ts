import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { weeksToDays } from 'date-fns'
import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsEmpty } from '../../../utils/dateUtils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import { PlacementApplication } from '../../../@types/shared'
import PreviousRotlPlacement from './previousRotlPlacement'
import { datesOfPlacementItem } from '../../../utils/placementRequests/datesOfPlacementItem'

type DateOfPlacementFromUi = {
  durationDays: string
  durationWeeks: string
  isFlexible: string
} & ObjectWithDateParts<'arrivalDate'>

export interface DateOfPlacement extends DateOfPlacementFromUi {
  duration: string
}

export type Body = {
  datesOfPlacement: Array<DateOfPlacementFromUi>
}

@Page({
  name: 'dates-of-placement',
  bodyProperties: ['datesOfPlacement'],
})
export default class DatesOfPlacement implements TasklistPage {
  title = 'Dates of placement'

  constructor(
    private _body: Body,
    private readonly placementApplication: PlacementApplication,
  ) {}

  get body() {
    return this._body as Body
  }

  set body(value: Body) {
    const validatedInputs = this.inputsPopulated(value.datesOfPlacement)
    const mappedInputs = this.mapDateInputs(validatedInputs)

    this._body = {
      datesOfPlacement: mappedInputs,
    } as Body
  }

  previous() {
    const previousRotlPlacement = retrieveQuestionResponseFromFormArtifact(
      this.placementApplication,
      PreviousRotlPlacement,
      'previousRotlPlacement',
    )

    return previousRotlPlacement === 'yes' ? 'same-ap' : 'previous-rotl-placement'
  }

  next() {
    return 'updates-to-application'
  }

  response() {
    const result = this.body.datesOfPlacement.map(dateBlock => {
      return datesOfPlacementItem(
        Number(this.lengthInDays(dateBlock)),
        dateBlock.arrivalDate,
        dateBlock.isFlexible === 'yes',
      )
    })

    return { 'Dates of placement': result }
  }

  errors() {
    const errors: Record<string, string> = {}
    const datesToCheck = this.body.datesOfPlacement.length ? this.body.datesOfPlacement : [{}]

    datesToCheck.forEach((date, index) => {
      if (!dateAndTimeInputsAreValidDates(date, 'arrivalDate')) {
        errors[`datesOfPlacement_${index}_arrivalDate`] = 'Enter an arrival date for the placement'
      }

      if (!Number(this.lengthInDays(date))) {
        errors[`datesOfPlacement_${index}_duration`] = 'Enter the duration of the placement'
      }
      if (!date.isFlexible) {
        errors[`datesOfPlacement_${index}_isFlexible`] = 'State if the placement date is flexible'
      }
    })

    return errors as TaskListErrors<this>
  }

  private lengthInDays(date: DateOfPlacementFromUi): string | undefined {
    if (date.durationWeeks || date.durationDays) {
      const lengthOfStayWeeksInDays = weeksToDays(Number(date.durationWeeks))
      const totalLengthInDays = lengthOfStayWeeksInDays + Number(date.durationDays)

      return String(totalLengthInDays)
    }
    return undefined
  }

  private inputsPopulated(datesArr: Array<DateOfPlacementFromUi> | undefined) {
    return (datesArr || []).filter(
      dates =>
        !dateIsEmpty(dates, 'arrivalDate') ||
        Boolean(dates.durationDays) ||
        Boolean(dates.durationWeeks) ||
        Boolean(dates.isFlexible),
    )
  }

  private mapDateInputs(dates: Array<DateOfPlacementFromUi>): Array<DateOfPlacement> {
    return dates.map(date => {
      return {
        ...date,
        duration: this.lengthInDays(date),
        isFlexible: date.isFlexible,
        ...DateFormats.dateAndTimeInputsToIsoString(date, 'arrivalDate'),
      }
    })
  }
}
