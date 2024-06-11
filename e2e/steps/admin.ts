import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { EditUser, Role } from '../pages/admin/editUser'
import { visitDashboard } from './apply'
import { UserList } from '../pages/admin/listUsers'

export const setRoles = async (page: Page, username: TestOptions['user']['name'], roles: ReadonlyArray<Role>) => {
  const dashboard = await visitDashboard(page)
  dashboard.clickUserMangement()

  const userListPage = await UserList.initialize(page)

  await userListPage.search(username)

  await userListPage.clickEditUser(username)

  const usersPage = new EditUser(page)

  await usersPage.uncheckSelectedQualifications()

  await usersPage.uncheckSelectedRoles()

  await usersPage.checkCheckBoxes([...roles, 'Administrator'])

  await usersPage.clickSave()
}
