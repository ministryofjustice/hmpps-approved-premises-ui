import type { TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { convictedOffenceResponseFromApplication } from '../../../../utils/applications/convictedOffenceResponseFromApplication'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'

export const interventionsTranslations = {
  accommodation: 'Accommodation',
  drugsAndAlcohol: 'Drugs and alcohol',
  childrenAndFamilies: 'Children and families',
  health: 'Health',
  educationTrainingAndEmployment: 'Education, training and employment',
  financeBenefitsAndDebt: 'Finance, benefits and debt',
  attitudesAndBehaviour: 'Attitudes, thinking and behaviour',
  abuse: 'Abuse',
  sexWorking: 'Sex working',
  other: 'Other',
} as const

type Interventions = Array<keyof typeof interventionsTranslations>
type RawInterventions = Interventions | keyof typeof interventionsTranslations

type RawRehabilitativeInterventionsBody = {
  rehabilitativeInterventions?: RawInterventions
  otherIntervention?: string
  summary: string
}
type RehabilitativeInterventionsBody = RawRehabilitativeInterventionsBody & {
  rehabilitativeInterventions: Interventions
}

@Page({
  name: 'rehabilitative-interventions',
  bodyProperties: ['rehabilitativeInterventions', 'otherIntervention', 'summary'],
})
export default class RehabilitativeInterventions implements TasklistPage {
  title =
    "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?"

  summaryQuestion = 'Provide a summary of how these interventions will assist the persons rehabilitation in the AP.'

  constructor(
    private _body: RawRehabilitativeInterventionsBody,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  public get body(): RehabilitativeInterventionsBody {
    return this._body as RehabilitativeInterventionsBody
  }

  public set body(value: RehabilitativeInterventionsBody) {
    const rehabilitativeInterventions: Interventions = value.rehabilitativeInterventions
      ? [value.rehabilitativeInterventions].flat()
      : []

    this._body = { ...value, rehabilitativeInterventions }

    if (this.responseContainsOther(rehabilitativeInterventions)) {
      this._body = {
        ...value,
        rehabilitativeInterventions,
        otherIntervention: value.otherIntervention as string,
      }
    }
  }

  previous() {
    return convictedOffenceResponseFromApplication(this.application) === 'no' ? 'convicted-offences' : 'date-of-offence'
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.title]: this.body.rehabilitativeInterventions
        .map(intervention => interventionsTranslations[intervention])
        .join(', '),
      [this.summaryQuestion]: this.body.summary,
    }

    if (!this.responseContainsOther(this.body.rehabilitativeInterventions)) {
      return response
    }

    return { ...response, 'Other intervention': this.body.otherIntervention }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (this.body?.rehabilitativeInterventions?.length <= 0) {
      errors.rehabilitativeInterventions = 'You must select at least one option'
    }

    if (this.responseContainsOther(this.body.rehabilitativeInterventions) && !this.body?.otherIntervention) {
      errors.otherIntervention = 'You must specify the other intervention'
    }

    if (!this.body?.summary) {
      errors.summary =
        'You must provide a summary of how these interventions will assist the persons rehabilitation in the AP'
    }
    return errors
  }

  items() {
    const { other, ...uiInterventions } = interventionsTranslations

    return convertKeyValuePairToCheckBoxItems(uiInterventions, this.body.rehabilitativeInterventions)
  }

  private responseContainsOther(
    interventions: Array<keyof typeof interventionsTranslations> = this.body.rehabilitativeInterventions,
  ): boolean {
    return !!interventions.find(element => element === 'other')
  }
}
