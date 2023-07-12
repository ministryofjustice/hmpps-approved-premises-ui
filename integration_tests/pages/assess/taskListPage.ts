import { ApprovedPremisesAssessment } from '../../../server/@types/shared/models/ApprovedPremisesAssessment'
import TaskList from '../taskListPage'

export default class TaskListPage extends Page {
  constructor() {
    super('Assess an Approved Premises (AP) application')
  }

  static visit(assessment: ApprovedPremisesAssessment) {
    cy.visit(`/assessments/${assessment.id}`)
    return new TaskListPage()
  }

  shouldShowTaskStatus = (task: string, status: string): void => {
    cy.get(`#${task}-status`).should('contain', status)
  }

  shouldNotShowSection = (section: string): void => {
    cy.get('.app-task-list').should('not.contain', section)
  }
}
