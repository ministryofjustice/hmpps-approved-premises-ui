import { Page } from '@playwright/test'
import { Premises } from '../../server/@types/shared'

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

  async clickActions() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
  }

  async fillField(label: string, value: string) {
    await this.page.getByRole('textbox', { name: label }).fill(value)
  }

  async checkRadio(label: string) {
    await this.page.getByLabel(label, { exact: true }).click()
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

  async checkUncheckedCheckboxes(labels: Array<string> | ReadonlyArray<string>) {
    labels.forEach(async label => {
      if (!(await this.page.getByRole('checkbox', { name: label }).isChecked())) {
        await this.page.getByRole('checkbox', { name: label }).dispatchEvent('click')
      }
    })
  }

  async fillDateField({ year, month, day }: { year: string; month: string; day: string }) {
    await this.page.getByLabel('Day', { exact: true }).first().fill(day)
    await this.page.getByLabel('Month', { exact: true }).first().fill(month)
    await this.page.getByLabel('Year', { exact: true }).first().fill(year)
  }

  async selectFirstPremises(legend: string): Promise<Premises['name']> {
    await this.page
      .getByRole('group', { name: legend })
      .getByRole('combobox', { name: 'Select an area' })
      .selectOption({ index: 1 })
    await this.page
      .getByRole('group', { name: legend })
      .getByRole('combobox', { name: 'Select a premises' })
      .selectOption({ index: 1 })

    const premisesNames = await this.page
      .getByRole('group', { name: legend })
      .getByRole('combobox', { name: 'Select a premises' })
      .innerText()

    return premisesNames.split('\n')[1]
  }
}
