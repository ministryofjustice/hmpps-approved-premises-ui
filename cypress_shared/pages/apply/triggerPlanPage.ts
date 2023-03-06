import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class TriggerPlanPage extends ApplyPage {
  additionalConditionsDetail: string

  constructor(application: ApprovedPremisesApplication) {
    super(
      'Contingency plans',
      application,
      'further-considerations',
      'trigger-plan',
      paths.applications.pages.show({
        id: application.id,
        task: 'further-considerations',
        page: 'contingency-plan-questions',
      }),
    )

    this.additionalConditionsDetail =
      application.data['further-considerations']['trigger-plan'].additionalConditionsDetail
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('planInPlace')
    this.checkRadioButtonFromPageBody('additionalConditions')
    this.completeTextArea('additionalConditionsDetail', this.additionalConditionsDetail)
  }
}
