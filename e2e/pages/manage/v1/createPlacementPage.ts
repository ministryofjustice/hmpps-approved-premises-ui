import { BasePage } from '../../basePage'

export class CreatePlacementPage extends BasePage {
  async chooseAp() {
    await this.page.getByLabel('Select an Area').selectOption({ index: 2 })
    await this.page.getByLabel('Select an Approved Premises').selectOption({ index: 1 })
  }

  async completeForm() {
    await this.chooseAp()
  }
}
