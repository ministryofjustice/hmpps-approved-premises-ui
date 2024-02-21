import { expect } from '@playwright/test'
import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { ReportsPage } from '../pages/admin/reports'
import { UserList } from '../pages/admin/listUsers'
import { AddUser } from '../pages/admin/addUser'
import { EditUser, roles } from '../pages/admin/editUser'
import { NewUserConfirmationPage } from '../pages/admin/newUserConfirmationPage'
import { DeleteUserConfirmationPage } from '../pages/admin/deleteUserConfirmationPage'

test('download reports', async ({ page }) => {
  // Given I visit the dashboard
  const dashboard = await visitDashboard(page)

  // When I click the download reports link
  await dashboard.clickDownloadData()

  // Then I should see the download reports page
  const reportsPage = await ReportsPage.initialize(page, 'Reports')

  const month = '01'
  const year = '2023'

  // When I download the lost beds report
  const lostBedsDownload = await reportsPage.downloadLostBedsReports({ month, year })
  // Then the file should be downloaded with the correct suggested name
  expect(lostBedsDownload.suggestedFilename()).toMatch(`lost-beds-${year}-${month}.xlsx`)

  // When I download the applications report
  const applicationsDownload = await reportsPage.downloadApplicationsReports({ month, year })
  // Then the file should be downloaded with the correct suggested name
  expect(applicationsDownload.suggestedFilename()).toMatch(`applications-${year}-${month}.xlsx`)
})

test('manage users', async ({ page }) => {
  const userToDeleteAndAdd = 'JOSEPHHOLLINSHEAD'

  // Given I visit the dashboard
  const dashboard = await visitDashboard(page)

  // When I click the manage users link
  await dashboard.clickUserMangement()

  // Then I should be taken to user list page
  const userListPage = await UserList.initialize(page)

  // When I click the add user link
  await userListPage.clickAddUser()

  // Then I should be taken to the add user page
  const addUserPage = await AddUser.initialize(page)

  // When I search for a user
  await addUserPage.search(userToDeleteAndAdd)

  // Then I should be taken to the confirmation page
  const newUserConfirmationPage = await NewUserConfirmationPage.initialize(page)

  // When I click continue
  await newUserConfirmationPage.clickContinue()

  // Then I should be taken to the Edit User page
  const editUserPage = await EditUser.initialize(page)

  // When I select all the checkboxes
  await editUserPage.checkCheckBoxes(roles)
  await editUserPage.assertCheckboxesAreSelected(roles)

  // And I click 'Save'
  await editUserPage.clickSave()

  // Then I should see the 'User updated' banner
  await editUserPage.shouldShowUserUpdatedBanner()

  // And all the checkboxes should be selected
  await editUserPage.assertCheckboxesAreSelected(roles)

  // When I unselect all the checkboxes
  await editUserPage.checkCheckBoxes(roles)
  await editUserPage.assertCheckboxesAreUnselected(roles)

  // And I click 'Save'
  await editUserPage.clickSave()

  // Then I should see the 'User updated' banner
  await editUserPage.shouldShowUserUpdatedBanner()

  // And all the checkboxes should be selected
  await editUserPage.assertCheckboxesAreUnselected(roles)

  // When I click 'Remove access'
  await editUserPage.clickRemoveAccess()

  // Then I should be taken to the confirmation page
  const deleteUserConfirmationPage = await DeleteUserConfirmationPage.initialize(page)

  // When I click 'Remove access'
  await deleteUserConfirmationPage.clickRemoveAccess()

  // Then I should see the 'User deleted' banner
  await userListPage.shouldShowUserDeletedBanner()

  // Given a user is not visisble in the list
  const userToSearchFor = 'AutomatedTestUser'
  await userListPage.shouldNotShowUser(userToSearchFor)

  // When I search for them
  await userListPage.search(userToSearchFor)

  // Then I should be able to see their name
  await userListPage.shouldShowUser(userToSearchFor)

  // When I click on their name
  await userListPage.clickEditUser(userToSearchFor)

  // Then I should be taken to the Edit User page
  await editUserPage.shouldShowUserName(userToSearchFor)
})
