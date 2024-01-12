import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class PreferredAps extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Select a preferred AP',
      application,
      'location-factors',
      'preferred-aps',
      paths.applications.pages.show({
        id: application.id,
        task: 'location-factors',
        page: 'describe-location-factors',
      }),
    )
  }

  completeForm() {
    this.getSelectInputByIdAndSelectAnEntry('region0', 'region1')
    this.selectSelectOptionFromPageBody('preferredAp1')
    this.getSelectInputByIdAndSelectAnEntry('region1', 'region2')
    this.selectSelectOptionFromPageBody('preferredAp2')
    this.getSelectInputByIdAndSelectAnEntry('region2', 'region3')
    this.selectSelectOptionFromPageBody('preferredAp3')
  }
}
