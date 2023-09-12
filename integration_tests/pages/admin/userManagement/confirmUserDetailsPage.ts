import Page from '../../page'
import paths from '../../../../server/paths/admin'
import { ApprovedPremisesUser as User } from '../../../../server/@types/shared'
import { userSummaryListItems } from '../../../../server/utils/users'

export default class ConfirmUserDetailsPage extends Page {
  constructor() {
    super('Confirm new user')
  }

  static visit(): ConfirmUserDetailsPage {
    cy.visit(paths.admin.userManagement.searchDelius({}))
    return new ConfirmUserDetailsPage()
  }

  shouldShowUserDetails(user: User): void {
    this.shouldContainSummaryListItems(userSummaryListItems(user))
  }

  clickContinue(): void {
    cy.get('a').contains('Continue').click()
  }
}
