import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PipeOpdScreening extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Has an application for PIPE placement been recommended in the OPD pathway plan?',
      application,
      'type-of-ap',
      'pipe-opd-screening',
      paths.applications.pages.show({ id: application.id, task: 'type-of-ap', page: 'pipe-referral' }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('pipeReferral')
    this.completeTextInputFromPageBody('pipeReferralMoreDetail')
  }
}
