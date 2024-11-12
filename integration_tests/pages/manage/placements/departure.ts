import type { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class DepartureNewPage extends Page {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Record a departure')
  }

  shouldShowFormAndExpectedDepartureDate(): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Expected departure date' },
        value: { text: DateFormats.isoDateToUIDate(this.placement.expectedDepartureDate) },
      },
    ])
    this.getLegend('What is the departure date?')
    this.getLabel('What is the time of departure?')
    this.getLegend('Reason')
  }
}
