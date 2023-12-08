import Page from '../page'
import { RiskLevelT } from '../../../server/form-pages/apply/reasons-for-placement/basic-information/enterRiskLevel'

export default class EnterRiskLevelPage extends Page {
  constructor() {
    super("We cannot check this person's tier")
  }

  completeForm(riskLevel: RiskLevelT): void {
    this.checkRadioByNameAndValue('riskLevel', riskLevel)
  }
}
