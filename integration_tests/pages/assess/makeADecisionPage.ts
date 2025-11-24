import { Cas1Assessment as Assessment } from '../../../server/@types/shared'

import AssessPage from './assessPage'

export default class MakeADecisionPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Make a decision', assessment, 'make-a-decision', 'make-a-decision', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('decision')
  }

  enterDecisionRationale() {
    this.completeTextInputFromPageBody('decisionRationale')
  }
}
