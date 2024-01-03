import type { ApprovedPremisesAssessment as Assessment, AssessmentSummary } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/assess'
import { shouldShowTableRows } from '../../helpers'
import {
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
} from '../../../server/utils/assessments/tableUtils'
import { AssessmentCurrentTab } from '../../../server/@types/ui'

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

  shouldShowAssessments(assessments: Array<AssessmentSummary>, activeTab: AssessmentCurrentTab) {
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
}
