import type { Cas1NewDeparture, Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export class MoveOnPage extends Page {
  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly newDeparture: Cas1NewDeparture,
  ) {
    super('Record a departure')
  }

  shouldShowFormAndExpectedDepartureDate(): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Expected departure date' },
        value: { text: DateFormats.isoDateToUIDate(this.placement.expectedDepartureDate) },
      },
    ])
    this.getLegend('Move on')
  }

  completeForm(moveOnCategoryId?: string) {
    this.checkRadioByNameAndValue('moveOnCategoryId', moveOnCategoryId || this.newDeparture.moveOnCategoryId)
  }

  shouldShowPopulatedForm(moveOnCategoryId?: string) {
    this.verifyRadioInputByName('moveOnCategoryId', moveOnCategoryId || this.newDeparture.moveOnCategoryId)
  }
}
