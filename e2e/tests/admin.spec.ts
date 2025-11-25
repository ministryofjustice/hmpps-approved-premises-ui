import { expect } from '@playwright/test'
import { test } from '../test'
import { ReportsPage } from '../pages/admin/reports'
import { UserList } from '../pages/admin/listUsers'
import { AddUser } from '../pages/admin/addUser'
import { EditUser, roles } from '../pages/admin/editUser'
import { NewUserConfirmationPage } from '../pages/admin/newUserConfirmationPage'
import { DeleteUserConfirmationPage } from '../pages/admin/deleteUserConfirmationPage'
import { signIn, visitDashboard } from '../steps/signIn'

test.describe.configure({ mode: 'parallel' })

test('download reports', async ({ page, reportViewer }) => {
  // Given I am signed in as a report viewer
  await signIn(page, reportViewer)

  // And I visit the dashboard
  const dashboard = await visitDashboard(page)

  // When I click the download reports link
  await dashboard.clickDownloadData()

  // Then I should see the download reports page
  const reportsPage = await ReportsPage.initialize(page, 'Reports')

  const startDate = '1/1/2023'
  const endDate = '31/1/2023'

  // When I download the out of service beds report
  const lostBedsDownload = await reportsPage.downloadOutOfServiceBedsReports({ startDate, endDate })
  // Then the file should be downloaded with the correct suggested name
  expect(lostBedsDownload.suggestedFilename()).toMatch(/out-of-service-beds-2023-01-01-to-2023-01-31-\d{8}_\d{4}.xlsx/)

  // When I download the daily metrics report
  const applicationsDownload = await reportsPage.downloadDailyMetricsReports({ startDate, endDate })
  // Then the file should be downloaded with the correct suggested name
  expect(applicationsDownload.suggestedFilename()).toMatch(/daily-metrics-2023-01-01-to-2023-01-31-\d{8}_\d{4}.csv/)
})

test('manage users', async ({ page, userToAddAndDelete, administrator }) => {
  // Given I am signed in as an administrator
  await signIn(page, administrator)

  // and I visit the dashboard
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
  await addUserPage.search(userToAddAndDelete.name)

  // Then I should be taken to the confirmation page
  const newUserConfirmationPage = await NewUserConfirmationPage.initialize(page)

  // When I click continue
  await newUserConfirmationPage.clickContinue()

  // Then I should be taken to the Edit User page
  const editUserPage = await EditUser.initialize(page)

  // When I assign all the roles to the users
  await editUserPage.applyRoles(roles)

  // And I click 'Save'
  await editUserPage.clickSave()

  // Then I should see the 'User updated' banner
  await editUserPage.shouldShowUserUpdatedBanner()

  // Then I see that the user has all the roles assigned
  await editUserPage.shouldHaveAllRolesAssigned(roles)

  // When I remove all the user's roles
  await editUserPage.deselectAllRoles(roles)

  // And I click 'Save'
  await editUserPage.clickSave()

  // Then I should see the 'User updated' banner
  await editUserPage.shouldShowUserUpdatedBanner()

  // And the user should have no roles assigned
  await editUserPage.shouldHaveNoRolesAssigned(roles)

  // When I click 'Remove access'
  await editUserPage.clickRemoveAccess()

  // Then I should be taken to the confirmation page
  const deleteUserConfirmationPage = await DeleteUserConfirmationPage.initialize(page)

  // When I click 'Remove access'
  await deleteUserConfirmationPage.clickRemoveAccess()

  // Then I should see the 'User deleted' banner
  await userListPage.shouldShowUserDeletedBanner()
})
