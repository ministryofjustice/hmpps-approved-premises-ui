import { ApprovedPremisesAssessment } from '../../../server/@types/shared/models/ApprovedPremisesAssessment'
import TaskList from '../taskListPage'

export default class TaskListPage extends TaskList {
  constructor(assessment: ApprovedPremisesAssessment) {
    super('Assess an Approved Premises (AP) application')
    if (!assessment.createdFromAppeal) {
      this.shouldNotShowAppealBanner()
    }
  }

  static visit(assessment: ApprovedPremisesAssessment) {
    cy.visit(`/cas1/assessments/${assessment.id}`)
    return new TaskListPage(assessment)
  }

  shouldShowAppealBanner() {
    cy.contains('This is an appealed assessment').should('exist')
  }

  shouldNotShowAppealBanner() {
    cy.contains('This is an appealed assessment').should('not.exist')
  }
}
