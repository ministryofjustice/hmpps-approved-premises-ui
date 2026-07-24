import { Cas1Application as Application } from '../../../server/@types/shared'
import ApplyPage from './applyPage'

export default class EsapRoomSearches extends ApplyPage {
  constructor(application: Application) {
    super('Enhanced room searches using body worn technology', application, 'type-of-ap', 'esap-placement-secreting')
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('secretingHistory')
    this.checkRadioButtonFromPageBody('secretingIntelligence')
    this.completeTextInputFromPageBody('secretingIntelligenceDetails')
    this.completeTextInputFromPageBody('secretingNotes')
  }
}
