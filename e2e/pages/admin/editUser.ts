import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export const qualifications = ['PIPE', 'Emergency APs', 'Limited access offenders', 'ESAP']

export type Qualification = (typeof qualifications)[number]

export const roles = [
  'Assessor',
  'Matcher',
  'Workflow manager',
  'Appeals manager',
  'Report viewer',
  'Future manager',
  'User manager',
  'Stop assessment allocations',
  'Stop match allocations',
  'Stop placement request allocations',
  ...qualifications,
] as const

export type Role = (typeof roles)[number]

export class EditUser extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Manage permissions')

    return new EditUser(page)
  }

  async clickSave(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  async clickRemoveAccess(): Promise<void> {
    await this.page.getByRole('button', { name: 'Remove access' }).click()
  }

  async shouldShowUserUpdatedBanner() {
    await expect(this.page.locator('h3')).toContainText('User updated')
  }

  async shouldShowUserName(username: string) {
    await expect(this.page.locator('h1')).toContainText('Manage permissions')
    await expect(this.page.getByRole('definition')).toHaveCount(5)
    this.page.getByRole('definition', { name: username })
  }

  async uncheckSelectedQualifications() {
    const qualifactionsSection = this.page.getByRole('group', { name: 'Select any additional' })
    const selectedCheckboxes = await qualifactionsSection.getByRole('checkbox', { checked: true }).all()

    const promises = [] as Array<Promise<void>>

    selectedCheckboxes.forEach(async checkbox => {
      promises.push(checkbox.dispatchEvent('click'))
    })

    await Promise.all(promises)
  }

  async assertCheckboxesAreSelected(labels: ReadonlyArray<Role>) {
    labels.forEach(async label => {
      expect(await this.page.getByLabel(label).isChecked()).toBeTruthy()
    })
  }

  async assertCheckboxesAreUnselected(labels: ReadonlyArray<Role>) {
    labels.forEach(async label => {
      expect(await this.page.getByLabel(label).isChecked()).toBeFalsy()
    })
  }

  async applyRoles(labels: ReadonlyArray<Role>) {
    this.checkUncheckedCheckboxes(labels)
  }

  async deselectAllRoles(labels: ReadonlyArray<Role>) {
    await this.checkCheckBoxes(labels)
    await this.assertCheckboxesAreUnselected(labels)
  }

  async shouldHaveAllRolesAssigned(labels: ReadonlyArray<Role>) {
    this.assertCheckboxesAreSelected(labels)
  }

  async shouldHaveNoRolesAssigned(labels: ReadonlyArray<Role>) {
    await this.assertCheckboxesAreUnselected(labels)
  }
}
