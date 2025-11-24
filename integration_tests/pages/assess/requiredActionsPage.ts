import type { Cas1Assessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class RequiredActionsPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Required actions to support a placement', assessment, 'required-actions', 'required-actions', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('additionalActions')
    this.completeTextInputFromPageBody('additionalActionsComments')

    this.checkRadioButtonFromPageBody('curfewsOrSignIns')
    this.completeTextInputFromPageBody('curfewsOrSignInsComments')

    this.checkRadioButtonFromPageBody('concernsOfUnmanagableRisk')

    this.completeTextInputFromPageBody('nameOfAreaManager')
    this.completeTextInputFromPageBody('outlineOfDiscussion')
    this.completeDateInputsFromPageBody('dateOfDiscussion')

    this.completeTextInputFromPageBody('concernsOfUnmanagableRiskComments')
    this.checkRadioButtonFromPageBody('additionalRecommendations')
    this.completeTextInputFromPageBody('additionalRecommendationsComments')
  }
}
