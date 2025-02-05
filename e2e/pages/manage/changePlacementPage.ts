import { BasePage } from '../basePage'

import { datePartStrings } from '../../utils'

export class ChangePlacementPage extends BasePage {
  async changePlacementDates(changedArrivalDate: Date, changedDepartureDate: Date) {
    await this.fillNamedDateField(datePartStrings(changedArrivalDate), 'arrivalDate')
    await this.fillNamedDateField(datePartStrings(changedDepartureDate), 'departureDate')
    await this.clickContinue()

    await this.clickSubmit('Confirm and book')
  }
}
