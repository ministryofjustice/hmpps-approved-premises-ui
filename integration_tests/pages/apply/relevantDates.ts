import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class RelevantDatesPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Which of the following dates are relevant?',
      application,
      'basic-information',
      'relevant-dates',
      paths.applications.pages.show({ id: application.id, page: 'board-taken-place', task: 'basic-information' }),
    )
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('selectedDates', { addArrayNotationToInputName: true })
    this.completeDateInputsFromPageBody('paroleEligibilityDate')
    this.completeDateInputsFromPageBody('homeDetentionCurfewDate')
    this.completeDateInputsFromPageBody('licenceExpiryDate')
    this.completeDateInputsFromPageBody('pssStartDate')
    this.completeDateInputsFromPageBody('pssEndDate')
    this.completeDateInputsFromPageBody('sentenceExpiryDate')
  }
}
