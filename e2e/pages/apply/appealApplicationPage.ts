import { BasePage } from '../basePage'

export class AppealApplicationPage extends BasePage {
  async fillForm() {
    await this.fillDateField({ year: '2023', month: '3', day: '12' })
    await this.fillField('What was the reason for the appeal?', 'Appeal reasons')
    await this.fillField('Who made the decision on the appeal?', 'Appeal staff details')
    await this.checkRadio('Upheld')
    await this.fillField('What are the reasons for the appeal decision?', 'Appeal decision reasons')
    await this.clickSave()
  }

  async clickSave(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }
}
