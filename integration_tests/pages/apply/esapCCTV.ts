import { ApprovedPremisesApplication } from '../../../server/@types/shared'
import ApplyPage from './applyPage'

export default class EsapCCTV extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Enhanced CCTV Provision', application, 'type-of-ap', 'esap-placement-cctv')
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('cctvHistory')
    this.checkRadioButtonFromPageBody('cctvIntelligence')
    this.completeTextInputFromPageBody('cctvIntelligenceDetails')
    this.completeTextInputFromPageBody('cctvNotes')
  }
}
