import type { TaskListErrors } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

import TasklistPage from '../../tasklistPage'

export const interventionsTranslations = {
  accomodation: 'Accomodation',
  drugsAndAlcohol: 'Drugs and alcohol',
  childrenAndFamilies: 'Children and families',
  health: 'Health',
  educationTrainingAndEmployment: 'Education, training and employment',
  financeBenefitsAndDebt: 'Finance, benefits and debt',
  attitudesAndBehaviour: 'Attitudes, thinking and behaviour',
  abuse: 'Abuse',
  other: 'Other',
} as const

type Interventions = Array<keyof typeof interventionsTranslations>

export default class RehabilitativeInterventions implements TasklistPage {
  name = 'rehabilitative-interventions'

  title = `Which rehabilitative interventions will support the person's Approved Premises (AP) placement?`

  body: { rehabilitativeInterventions: Interventions; otherIntervention?: string }

  constructor(
    body: Record<string, unknown>,
    private readonly _application: Application,
    private readonly previousPage: string,
  ) {
    const rehabilitativeInterventions = body.rehabilitativeInterventions
      ? ([body.rehabilitativeInterventions].flat() as Interventions)
      : []

    this.body = { rehabilitativeInterventions }

    if (this.otherInterventionDetailIsNeeded(rehabilitativeInterventions)) {
      this.body = {
        rehabilitativeInterventions,
        otherIntervention: body.otherIntervention as string,
      }
    }
  }

  previous() {
    return this.previousPage
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.title]: this.body.rehabilitativeInterventions
        .map(intervention => interventionsTranslations[intervention])
        .join(', '),
    }

    if (!this.otherInterventionDetailIsNeeded(this.body.rehabilitativeInterventions)) {
      return response
    }

    return { ...response, 'Other intervention': this.body.otherIntervention }
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (this.otherInterventionDetailIsNeeded(this.body?.interventions) && !this.body?.otherIntervention) {
      errors.otherIntervention = 'You must specify the other intervention'
    }

    return errors
  }

  items() {
    const { other, ...uiInterventions } = interventionsTranslations

    return convertKeyValuePairToCheckBoxItems(uiInterventions, this.body?.rehabilitativeInterventions)
  }

  private otherInterventionDetailIsNeeded(interventions: Interventions) {
    return interventions.find(element => element === 'other')
  }
}
