import { addDays, getDate, getMonth, getYear } from 'date-fns'
import { BasePage } from '../basePage'

export class CreatePlacementPage extends BasePage {
  async enterArrivalDate() {
    await this.page
      .getByRole('group', { name: 'What is their expected arrival date?' })
      .getByLabel('Day')
      .fill(getDate(new Date()).toString())
    await this.page
      .getByRole('group', { name: 'What is their expected arrival date?' })
      .getByLabel('Month')
      .fill((getMonth(new Date()) + 1).toString())
    await this.page
      .getByRole('group', { name: 'What is their expected arrival date?' })
      .getByLabel('Year')
      .fill(getYear(new Date()).toString())
  }

  async enterExpectedDepartureDate() {
    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Day')
      .fill(getDate(addDays(new Date(), 1)).toString())

    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Month')
      .fill((getMonth(addDays(new Date(), 1)) + 1).toString())
    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Year')
      .fill(getYear(addDays(new Date(), 1)).toString())
  }

  async chooseIndexOffence() {
    await this.page.getByRole('group', { name: 'Select an index offence' }).getByRole('radio').first().click()
  }

  async completeForm() {
    await this.chooseIndexOffence()
    await this.enterArrivalDate()
    await this.enterExpectedDepartureDate()
  }
}
