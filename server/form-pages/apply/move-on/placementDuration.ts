import { addDays, weeksToDays } from 'date-fns'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Cas1Application as Application, Cas1Application } from '@approved-premises/api'
import { DateFormats, weeksAndDaysToDays } from '../../../utils/dateUtils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { sentenceCase } from '../../../utils/utils'
import { getDefaultPlacementDurationInDays } from '../../../utils/applications/getDefaultPlacementDurationInDays'
import { arrivalDateFromApplication } from '../../../utils/applications/arrivalDateFromApplication'
import { personTier } from '../../../utils/personUtils'
import { validWeeksAndDaysDuration } from '../../../utils/formUtils'

type PlacementDurationBody = {
  differentDuration: YesOrNo
  durationDays?: string
  durationWeeks?: string
  duration?: string
  reason?: string
  defaultDurationDays?: number
  maxDurationDays?: number
}

const title = 'Placement duration and move on'
const titleV3 = 'Placement length and dates'

const questions = {
  differentDuration: 'Does this application require a different placement duration?',
  duration: 'How many weeks will the person stay at the AP?',
  reason: 'Why does this person require a different placement duration?',
}

const questionsV3 = {
  differentDuration: 'Do you want to change the placement length?',
  duration: 'New placement length',
  reason: 'Reason for change',
}

@Page({
  name: 'placement-duration',
  bodyProperties: [
    'differentDuration',
    'duration',
    'durationDays',
    'durationWeeks',
    'reason',
    'defaultDurationDays',
    'maxDurationDays',
  ],
})
export default class PlacementDuration implements TasklistPage {
  title: string

  arrivalDate: string | undefined

  departureDate: string | undefined

  isV3Tier: boolean

  questions: typeof questions

  dataServices: DataServices

  constructor(
    public body: Partial<PlacementDurationBody>,
    private readonly application: Cas1Application,
  ) {
    this.isV3Tier = personTier(application.person)?.version === 'V3'
    this.title = this.isV3Tier ? titleV3 : title
    this.questions = this.isV3Tier ? questionsV3 : questions
    this.body.duration = this.lengthInDays()
  }

  static async initialize(
    body: Partial<PlacementDurationBody>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ): Promise<PlacementDuration> {
    const page = new PlacementDuration(body, application)
    await page.initializeDates(dataServices, token)

    return page
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'relocation-region'
  }

  get keepDurationLabel(): string {
    return this.body.defaultDurationDays !== undefined
      ? `No, apply for ${DateFormats.formatDuration(this.body.defaultDurationDays)}`
      : 'No'
  }

  response() {
    const response: PageResponse = {}

    response[this.questions.differentDuration] = sentenceCase(this.body.differentDuration)

    if (this.body.differentDuration === 'yes') {
      response[this.questions.duration] = sentenceCase(
        `${DateFormats.formatDuration(weeksAndDaysToDays(this.body.durationWeeks, this.body.durationDays))}`,
      )
      response[this.questions.reason] = this.body.reason
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.differentDuration) {
      errors.differentDuration = this.isV3Tier
        ? 'You must specify if you want to change the placement length'
        : 'You must specify if this application requires a different placement length'
    }

    if (this.body.differentDuration === 'yes') {
      if (!validWeeksAndDaysDuration(this.body.durationWeeks, this.body.durationDays)) {
        errors.duration = this.isV3Tier
          ? 'You must specify the new placement length'
          : 'You must specify the duration of the placement'
      }

      if (!this.body.reason) {
        errors.reason = this.isV3Tier
          ? 'You must specify the reason for the change'
          : 'You must specify the reason for the different placement duration'
      }
    }
    if (this.body.differentDuration === 'no') {
      // This error message won't be seen as the duration is set during initialization.
      // It's here so that in-progress applications that don't have a duration will force the task to 'In progress'
      if (!this.body.defaultDurationDays) {
        errors.defaultDurationDays = 'Calculate duration'
      }
    }

    return errors
  }

  private lengthInDays(): string | undefined {
    if (this.body.differentDuration === 'yes' && this.body.durationDays && this.body.durationWeeks) {
      return String(weeksToDays(Number(this.body.durationWeeks)) + Number(this.body.durationDays))
    }

    return undefined
  }

  private async initializeDates(dataServices: DataServices, token: string): Promise<void> {
    const arrivalDateIso = arrivalDateFromApplication(this.application)
    const { defaultDurationDays, maxDurationDays } = await getDefaultPlacementDurationInDays(
      this.application,
      dataServices,
      token,
    )
    this.body.maxDurationDays = maxDurationDays
    this.body.defaultDurationDays = defaultDurationDays

    if (arrivalDateIso) {
      const arrivalDate = DateFormats.isoToDateObj(arrivalDateIso)
      const departureDate = addDays(arrivalDate, defaultDurationDays)

      this.arrivalDate = DateFormats.dateObjtoUIDate(arrivalDate)
      this.departureDate = DateFormats.dateObjtoUIDate(departureDate)
    }
  }
}
