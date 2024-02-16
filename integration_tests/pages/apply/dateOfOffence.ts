import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class DateOfOffence extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Convicted offences',
      application,
      'risk-management-features',
      'date-of-offence',
      paths.applications.pages.show({
        id: application.id,
        task: 'risk-management-features',
        page: 'convicted-offences',
      }),
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('arsonOffence')
    this.checkCheckboxesFromPageBody('hateCrime')
    this.checkCheckboxesFromPageBody('nonSexualOffencesAgainstChildren')
    this.checkCheckboxesFromPageBody('contactSexualOffencesAgainstAdults')
    this.checkCheckboxesFromPageBody('nonContactSexualOffencesAgainstAdults')
    this.checkCheckboxesFromPageBody('contactSexualOffencesAgainstChildren')
    this.checkCheckboxesFromPageBody('nonContactSexualOffencesAgainstChildren')
  }
}
