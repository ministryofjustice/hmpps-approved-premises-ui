import type {
  Cas1Assessment as Assessment,
  Cas1AssessmentStatus,
  Cas1AssessmentSummary,
  PlacementApplicationTask,
} from '@approved-premises/api'

import { AssessmentCurrentTab } from '@approved-premises/ui'
import Page from '../page'
import paths from '../../../server/paths/assess'
import { shouldShowTableRows } from '../../helpers'
import {
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
} from '../../../server/utils/assessments/tableUtils'
import { tableUtils as placementApplicationTableUtils } from '../../../server/utils/placementApplications'

export default class ListPage extends Page {
  constructor() {
    super('Approved Premises applications')
  }

  static visit(tab?: Cas1AssessmentStatus | 'requests_for_placement'): ListPage {
    const url = paths.assessments.index({}) + (tab ? `?activeTab=${tab}` : '')
    cy.visit(url)
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

  clickRequestsForPlacement() {
    cy.get('a').contains('Requests for placement').click()
  }

  clickPersonName(name: string): void {
    cy.get('a').contains(name).click()
  }

  shouldShowAssessments(assessments: Array<Cas1AssessmentSummary>, activeTab: AssessmentCurrentTab) {
    let tableRowFunction
    switch (activeTab) {
      case 'awaiting_response':
        tableRowFunction = requestedFurtherInformationTableRows
        break
      case 'awaiting_assessment':
        tableRowFunction = awaitingAssessmentTableRows
        break
      case 'completed':
        tableRowFunction = completedTableRows
        break
      default:
        tableRowFunction = awaitingAssessmentTableRows
        break
    }
    shouldShowTableRows(tableRowFunction(assessments))
  }

  shouldShowPlacementApplicationTasks(placementApplicationTasks: Array<PlacementApplicationTask>): void {
    shouldShowTableRows(placementApplicationTableUtils.tableRows(placementApplicationTasks))
  }
}
