import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/assess'

export default class ListPage extends Page {
  constructor() {
    super('Approved Premises applications')
  }

  static visit(): ListPage {
    cy.visit(paths.assessments.index({}))
    return new ListPage()
  }

  clickCompleted() {
    cy.get('a').contains('Completed').click()
  }

  clickAssessment(assessment: Assessment): void {
    cy.get(`a[data-cy-assessmentId="${assessment.id}"]`).click()
  }

  clickRequestedFurtherInformation() {
    cy.get('a').contains('Requested further information').click()
  }
}
