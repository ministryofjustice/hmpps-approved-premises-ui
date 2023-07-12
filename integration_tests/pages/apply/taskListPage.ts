import { ApprovedPremisesApplication } from '@approved-premises/api'
import TaskList from '../taskListPage'

export default class TaskListPage extends Page {
  constructor() {
    super('Apply for an Approved Premises (AP) placement')
  }

  static visit(application: ApprovedPremisesApplication) {
    cy.visit(`/applications/${application.id}`)
    return new TaskListPage()
  }

  shouldShowTaskStatus = (task: string, status: string): void => {
    cy.get(`#${task}-status`).should('contain', status)
  }
}
