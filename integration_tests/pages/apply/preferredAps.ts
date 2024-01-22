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
    this.getSelectInputByIdAndSelectAnEntry('area0', 'area1')
    this.selectSelectOptionFromPageBody('preferredAp1')
    this.getSelectInputByIdAndSelectAnEntry('area1', 'area2')
    this.selectSelectOptionFromPageBody('preferredAp2')
    this.getSelectInputByIdAndSelectAnEntry('area2', 'area3')
    this.selectSelectOptionFromPageBody('preferredAp3')
  }
}
