import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PipeReferralPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Has the person been screened into the Offender Personality Disorder Pathway (OPD)?',
      application,
      'type-of-ap',
      'pipe-referral',
      paths.applications.pages.show({ id: application.id, task: 'type-of-ap', page: 'ap-type' }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('opdPathway')
    this.completeDateInputsFromPageBody('opdPathwayDate')
  }
}
