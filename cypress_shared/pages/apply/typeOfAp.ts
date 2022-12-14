import { ApprovedPremisesApplication } from '../../../server/@types/shared'
import ApplyPage from './applyPage'

export default class TypeOfApPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(`Which type of AP does ${application.person.name} require?`, application, 'type-of-ap', 'ap-type')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('type')
  }
}
