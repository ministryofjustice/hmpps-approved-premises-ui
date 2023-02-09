import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/assess'
import { allocatedTableRows, unallocatedTableRows } from '../../../server/utils/assessments/utils'
import { shouldShowTableRows } from '../../helpers'

export default class AllocationsListPage extends Page {
  constructor(
    private readonly allocatedAssessments: Array<Assessment>,
    private readonly unallocatedAssessments: Array<Assessment>,
  ) {
    super('Approved Premises applications')
  }

  static visit(
    allocatedAssessments: Array<Assessment>,
    unallocatedAssessments: Array<Assessment>,
  ): AllocationsListPage {
    cy.visit(paths.assessments.index({}))
    return new AllocationsListPage(allocatedAssessments, unallocatedAssessments)
  }

  shouldShowAllocatedAssessments(): void {
    shouldShowTableRows(this.allocatedAssessments, allocatedTableRows)
  }

  shouldShowUnallocatedAssessments(): void {
    shouldShowTableRows(this.unallocatedAssessments, unallocatedTableRows)
  }

  clickMyAssessments() {
    cy.get('a').contains('My Assessments').click()
  }

  clickUnallocated() {
    cy.get('a').contains('Unallocated').click()
  }
}
