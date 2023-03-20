import type { ApprovedPremisesApplication as Application, ApprovedPremisesUser as User } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/tasks'

import { applicationSummary } from '../../../server/utils/tasks'

export default class AllocationsPage extends Page {
  constructor(private readonly application: Application) {
    super(`Task for allocation`)
  }

  static visit(application: Application): AllocationsPage {
    cy.visit(paths.allocations.show({ id: application.id }))
    return new AllocationsPage(application)
  }

  shouldShowInformationAboutTask() {
    const summaryListItems = applicationSummary(this.application)

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
