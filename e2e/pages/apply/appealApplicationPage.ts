import { AppealDecision } from '@approved-premises/e2e'
import { BasePage } from '../basePage'

export class AppealApplicationPage extends BasePage {
  async fillForm(decision: AppealDecision) {
    await this.fillDateField({ year: '2023', month: '3', day: '12' })
    await this.fillField('What was the reason for the appeal?', 'Appeal reasons')
    await this.checkRadio(decision)
    await this.fillField('What are the reasons for the appeal decision?', 'Appeal decision reasons')
    await this.clickSave()
  }

  async clickSave(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }
}
