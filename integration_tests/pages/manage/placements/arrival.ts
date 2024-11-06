import type { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class ArrivalCreatePage extends Page {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Record someone as arrived')
  }

  shouldShowFormAndExpectedArrivalDate(): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Expected arrival date' },
        value: { text: DateFormats.isoDateToUIDate(this.placement.expectedArrivalDate) },
      },
    ])
    this.getLegend('What is the arrival date?')
    this.getLabel('What is the time of arrival?')
  }

  completeForm(): void {
    this.completeDateInputs('arrivalDateTime', this.placement.expectedArrivalDate)
    this.completeTextInput('arrivalTime', '9:45')
  }
}
