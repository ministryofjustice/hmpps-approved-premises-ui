import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import MakeADecision from '../../../server/form-pages/assess/makeADecision/makeADecisionTask/makeADecision'
import AssessPage from './assessPage'

export default class MakeADecisionPage extends AssessPage {
  pageClass = new MakeADecision({ decision: 'releaseDate' })

  constructor(assessment: Assessment) {
    super(assessment, 'Make a decision')
  }

  completeForm() {
    this.checkRadioByNameAndValue('decision', 'releaseDate')
  }
}
