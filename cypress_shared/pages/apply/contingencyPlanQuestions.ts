import { ApprovedPremisesApplication } from '@approved-premises/api'
import { ContingencyPlanQuestionsBody } from '../../../server/@types/ui'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ContingencyPlanQuestionsPage extends ApplyPage {
  contingencyPlanQuestions: ContingencyPlanQuestionsBody

  constructor(application: ApprovedPremisesApplication, contingencyPlanQuestionsBody: ContingencyPlanQuestionsBody) {
    super(
      'Contingency plans',
      application,
      'further-considerations',
      'contingency-plan-questions',
      paths.applications.show({ id: application.id }),
    )
    this.contingencyPlanQuestions = contingencyPlanQuestionsBody
  }

  completeForm() {
    Object.keys(this.contingencyPlanQuestions).forEach(key => {
      cy.get(`[name="${key}"]`).type(this.contingencyPlanQuestions[key])
    })
  }

  clickSubmit(): void {
    cy.get('button').contains('Save and continue').click()
  }
}
