import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { ApprovedPremisesUser as User } from '../../../../server/@types/shared'
import { userSummaryListItems } from '../../../../server/utils/users'

export default class ShowPage extends Page {
  constructor() {
    super('Manage permissions')
  }

  static visit(userId: string): ShowPage {
    cy.visit(paths.admin.userManagement.show({ id: userId }))
    return new ShowPage()
  }

  shouldShowUserDetails(user: User): void {
    this.shouldContainSummaryListItems(userSummaryListItems(user))
  }
}
