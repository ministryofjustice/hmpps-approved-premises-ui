import type { ApprovedPremisesAssessment as Assessment, ApprovedPremisesUser as User } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/assess'

import { allocationSummary } from '../../../server/utils/assessments/utils'

export default class AllocationsPage extends Page {
  constructor(private readonly assessment: Assessment) {
    super(`Assessment for ${assessment.application.person.name}`)
  }

  static visit(assessment: Assessment): AllocationsPage {
    cy.visit(paths.allocations.show({ id: assessment.application.id }))
    return new AllocationsPage(assessment)
  }

  shouldShowInformationAboutAssessment() {
    const summaryListItems = allocationSummary(this.assessment)

    summaryListItems.forEach(item => {
      const key = 'text' in item.key ? item.key.text : item.key.html
      const value = 'text' in item.value ? item.value.text : item.value.html
      this.assertDefinition(key, value)
    })
  }

  shouldShowUsers(users: Array<User>) {
    cy.get('select#userId option').should('have.length', users.length + 1)

    users.forEach(u => {
      cy.get('select#userId option').contains(u.name).should('be.visible')
    })
  }

  selectUser(user: User) {
    this.getSelectInputByIdAndSelectAnEntry('userId', user.id)
  }
}
