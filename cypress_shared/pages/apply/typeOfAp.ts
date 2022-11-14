import { Application } from '../../../server/@types/shared'
import ApplyPage from './applyPage'

export default class TypeOfApPage extends ApplyPage {
  constructor(application: Application) {
    super(`Which type of AP does ${application.person.name} require?`, application, 'type-of-ap', 'ap-type')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('type')
  }
}
