import { Cas1Assessment } from '@approved-premises/api'
import TaskList from '../taskListPage'
import paths from '../../../server/paths/assess'

export default class TaskListPage extends TaskList {
  constructor(assessment: Cas1Assessment) {
    super('Assess an Approved Premises (AP) application')
    if (!assessment.createdFromAppeal) {
      this.shouldNotShowAppealBanner()
    }
  }

  static visit(assessment: Cas1Assessment) {
    cy.visit(paths.assessments.show({ id: assessment.id }))
    return new TaskListPage(assessment)
  }

  shouldShowAppealBanner() {
    cy.contains('This is an appealed assessment').should('exist')
  }

  shouldNotShowAppealBanner() {
    cy.contains('This is an appealed assessment').should('not.exist')
  }
}
