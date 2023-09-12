import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { ApprovedPremisesUser as User } from '../../../../server/@types/shared'
import { userSummaryListItems } from '../../../../server/utils/users'

export default class ConfirmDeletionPage extends Page {
  constructor() {
    super("Confirm user's access to AP service should be removed")
  }

  static visit(userId: string): ConfirmDeletionPage {
    cy.visit(paths.admin.userManagement.confirmDelete({ id: userId }))
    return new ConfirmDeletionPage()
  }

  shouldShowUserDetails(user: User): void {
    this.shouldContainSummaryListItems(userSummaryListItems(user))
  }
}
