import { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export class EmergencyDetailsPage extends Page {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Enter the emergency transfer details')
  }

  shouldShowForm() {
    this.getLabel('Where is the person being transferred to?')
    this.getLegend('What is the end date of the placement?')
    this.getHint(
      `Enter the expected departure date. The current departure date is ${DateFormats.isoDateToUIDate(this.placement.expectedDepartureDate)}`,
    )
  }

  completeForm(destinationApId: string, placementEndDate: string) {
    this.getSelectInputByIdAndSelectAnEntry('destinationPremisesId', destinationApId)
    this.clearAndCompleteDateInputs('placementEndDate', placementEndDate)
    this.clickContinue()
  }
}
