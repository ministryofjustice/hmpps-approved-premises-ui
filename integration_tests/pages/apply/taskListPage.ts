import { ApprovedPremisesApplication } from '@approved-premises/api'
import TaskList from '../taskListPage'

export default class TaskListPage extends TaskList {
  constructor() {
    super('Apply for an Approved Premises (AP) placement')
  }

  static visit(application: ApprovedPremisesApplication) {
    cy.visit(`/applications/${application.id}`)
    return new TaskListPage()
  }

  shouldNotShowSubmitComponents(): void {
    cy.get('input[value="submit"]').should('not.exist')
    cy.get('input[name="confirmation"]').should('not.exist')
    cy.get('button').should('not.exist')
  }
}
