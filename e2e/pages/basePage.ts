import { Page } from '@playwright/test'

export class BasePage {
  constructor(public readonly page: Page) {}

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save and continue' }).click()
  }

  async clickSubmit() {
    await this.page.getByRole('button', { name: 'Submit' }).click()
  }

  async clickContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click()
  }

  async clickWithdraw() {
    await this.page.getByRole('button', { name: 'Withdraw' }).click()
  }

  async fillField(label: string, value: string) {
    await this.page.getByRole('textbox', { name: label }).fill(value)
  }

  async checkRadio(label: string) {
    await this.page.getByLabel(label, { exact: true }).check()
  }

  async checkRadioInGroup(group: string, label: string) {
    await this.page
      .getByRole('group', {
        name: group,
      })
      .getByLabel(label, { exact: true })
      .check()
  }

  async checkCheckBoxes(labels: Array<string> | ReadonlyArray<string>) {
    const promises = [] as Array<Promise<void>>

    for (let i = 0; i < labels.length; i += 1) {
      promises.push(this.page.getByRole('checkbox', { name: labels[i] }).dispatchEvent('click'))
    }

    await Promise.all(promises)
  }

  async fillDateField({ year, month, day }: { year: string; month: string; day: string }) {
    await this.page.getByLabel('Day', { exact: true }).first().fill(day)
    await this.page.getByLabel('Month', { exact: true }).first().fill(month)
    await this.page.getByLabel('Year', { exact: true }).first().fill(year)
  }

  async selectFirstPremises(legend: string) {
    await this.page
      .getByRole('group', { name: legend })
      .getByRole('combobox', { name: 'Select an area' })
      .selectOption({ index: 1 })
    await this.page
      .getByRole('group', { name: legend })
      .getByRole('combobox', { name: 'Select a premises' })
      .selectOption({ index: 1 })
  }
}
