import ApplyPage from './applyPage'
import { Cas1Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'

export default class ReasonForShortNoticePage extends ApplyPage {
  constructor(application: Cas1Application) {
    super(
      'Emergency application',
      application,
      'basic-information',
      'reason-for-short-notice',
      paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'placement-date' }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('reason')
  }
}
