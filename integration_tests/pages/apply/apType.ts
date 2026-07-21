import { Cas1Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class TypeOfApPage extends ApplyPage {
  constructor(application: Cas1Application) {
    super(
      `Which type of AP does the person require?`,
      application,
      'type-of-ap',
      'ap-type',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('type')
  }
}
