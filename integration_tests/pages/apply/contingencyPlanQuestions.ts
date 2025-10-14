import { ApprovedPremisesApplication } from '@approved-premises/api'
import { ContingencyPlanQuestionsBody, PartnerAgencyDetails } from '../../../server/@types/ui'
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

  shouldShowPartnerAgencyNames(partnerAgencies: Array<PartnerAgencyDetails>) {
    cy.get('h2').contains('Partner agencies added to application').should('be.visible')
    cy.get('dl').within(() => {
      partnerAgencies.forEach((partnerAgency, index) => {
        const key = `Partner agency${partnerAgencies.length > 1 ? ` ${index + 1}` : ''}`
        this.assertDefinition(key, partnerAgency.partnerAgencyName)
      })
    })
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
