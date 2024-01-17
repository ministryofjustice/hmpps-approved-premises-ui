import Page from '../../page'
import paths from '../../../../server/paths/admin'

import { ApprovedPremisesUser as User } from '../../../../server/@types/shared'
import { tableRowsToArrays } from '../../../helpers'
import { managementDashboardTableRows } from '../../../../server/utils/users/tableUtils'

export default class ListPage extends Page {
  constructor() {
    super('User management dashboard')
  }

  static visit(): ListPage {
    cy.visit(paths.admin.userManagement.index({}))
    return new ListPage()
  }

  shouldShowUsers(users: Array<User>): void {
    const tableRows = managementDashboardTableRows(users)
    const rowItems = tableRowsToArrays(tableRows)

    rowItems.forEach(columns => {
      const headerCell = columns.shift()
      cy.contains('th', headerCell)
        .parent('tr')
        .within(() => {
          columns.forEach((e, i) => {
            cy.get('td').eq(i).invoke('text').should('contain', e)
          })
        })
    })
  }

  clickUser(userName: string): void {
    cy.get('a').contains(userName).click()
  }

  search(userName: string): void {
    this.getTextInputByIdAndEnterDetails('search-by-name', userName)
    cy.get('button').contains('Search').click()
  }

  clickAddUser(): void {
    cy.get('a').contains('Add new user').click()
  }

  searchBy(id: string, item: string): void {
    this.getSelectInputByIdAndSelectAnEntry(id, item)
  }

  clickApplyFilter(): void {
    cy.get('button').contains('Apply filters').click()
  }
}
