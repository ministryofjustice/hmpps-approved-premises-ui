import { ApprovedPremisesAssessment } from '../../../server/@types/shared/models/ApprovedPremisesAssessment'
import TaskList from '../taskListPage'

export default class TaskListPage extends TaskList {
  constructor() {
    super('Assess an Approved Premises (AP) application')
  }

  static visit(assessment: ApprovedPremisesAssessment) {
    cy.visit(`/assessments/${assessment.id}`)
    return new TaskListPage()
  }
}
