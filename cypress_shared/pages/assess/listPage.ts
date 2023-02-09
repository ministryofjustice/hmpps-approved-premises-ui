import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/assess'
import { shouldShowTableRows } from '../../helpers'
import {
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
} from '../../../server/utils/assessments/utils'

export default class ListPage extends Page {
  constructor(
    private readonly awaitingAssessments: Array<Assessment>,
    private readonly assessmentsCloseToDueDate: Array<Assessment>,
    private readonly completedAssesssments: Array<Assessment>,
    private readonly pendingAssessments: Array<Assessment>,
  ) {
    super('Approved Premises applications')
  }

  static visit(
    awaitingAssessments: Array<Assessment>,
    assessmentsCloseToDueDate: Array<Assessment> = [],
    completedAssesssments: Array<Assessment> = [],
    pendingAssessments: Array<Assessment> = [],
  ): ListPage {
    cy.visit(paths.assessments.index({}))
    return new ListPage(awaitingAssessments, assessmentsCloseToDueDate, completedAssesssments, pendingAssessments)
  }

  shouldShowAwaitingAssessments(): void {
    const assessments = [this.awaitingAssessments, this.assessmentsCloseToDueDate].flat()
    shouldShowTableRows(assessments, awaitingAssessmentTableRows)
  }

  shouldShowPendingAssessments(): void {
    shouldShowTableRows(this.pendingAssessments, requestedFurtherInformationTableRows)
  }

  shouldShowNotification(): void {
    cy.get('.moj-notification-badge').contains(
      `${this.assessmentsCloseToDueDate.length} assessments approaching due date`,
    )
  }

  shouldHighlightAssessmentsApproachingDueDate(): void {
    this.assessmentsCloseToDueDate.forEach((item: Assessment) => {
      cy.contains(item.application.person.name)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(4).get('.assessments--index__warning').contains('(Approaching due date)')
        })
    })
  }

  shouldShowCompletedAssessments(): void {
    shouldShowTableRows(this.completedAssesssments, completedTableRows)
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
