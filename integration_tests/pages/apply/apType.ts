import { Cas1Application as Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class TypeOfApPage extends ApplyPage {
  constructor(application: Application) {
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
