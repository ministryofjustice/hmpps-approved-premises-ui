import type { Assessment, PersonRisks } from '@approved-premises/api'
import { format } from 'date-fns'

import Page from '../page'
import paths from '../../../server/paths/assess'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class ListPage extends Page {
  constructor(
    private readonly awaitingAssessments: Array<Assessment>,
    private readonly assessmentsCloseToDueDate: Array<Assessment>,
    private readonly completedAssesssments: Array<Assessment>,
  ) {
    super('Approved Premises applications')
  }

  static visit(
    awaitingAssessments: Array<Assessment>,
    assessmentsCloseToDueDate: Array<Assessment> = [],
    completedAssesssments: Array<Assessment> = [],
  ): ListPage {
    cy.visit(paths.assessments.index({}))
    return new ListPage(awaitingAssessments, assessmentsCloseToDueDate, completedAssesssments)
  }

  shouldShowAwaitingAssessments(risks: Record<string, PersonRisks>): void {
    const assessments = [this.awaitingAssessments, this.assessmentsCloseToDueDate].flat()
    assessments.forEach((item: Assessment) => {
      cy.contains(item.application.person.name)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.application.person.crn)
          cy.get('td').eq(1).contains(risks[item.application.person.crn].tier.value.level)
          cy.get('td')
            .eq(2)
            .contains(
              format(
                DateFormats.isoToDateObj(item.application.data['basic-information']['release-date'].releaseDate),
                'd MMM yyyy',
              ),
            )
          cy.get('td').eq(3).contains(item.application.person.prisonName)
          cy.get('td')
            .eq(4)
            .contains(this.awaitingAssessments.includes(item) ? '7 Days' : '1 Day')
          cy.get('td').eq(5).contains('In progress')
        })
    })
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

  shouldShowCompletedAssessments(risks: Record<string, PersonRisks>): void {
    this.completedAssesssments.forEach((item: Assessment) => {
      cy.log(item.application.data['basic-information']['release-date'])
      cy.contains(item.application.person.name)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.application.person.crn)
          cy.get('td').eq(1).contains(risks[item.application.person.crn].tier.value.level)
          cy.get('td')
            .eq(2)
            .contains(
              format(
                DateFormats.isoToDateObj(item.application.data['basic-information']['release-date'].releaseDate),
                'd MMM yyyy',
              ),
            )
          cy.get('td').eq(3).contains('Completed')
        })
    })
  }

  clickCompleted() {
    cy.get('a').contains('Completed').click()
  }

  clickAssessment(assessment: Assessment): void {
    cy.get(`a[data-cy-assessmentId="${assessment.id}"]`).click()
  }
}
