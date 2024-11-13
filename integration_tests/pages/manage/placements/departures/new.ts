import type { Cas1NewDeparture, Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import paths from '../../../../../server/paths/manage'

export class DepartureNewPage extends Page {
  departureDate: string

  departureTime: string

  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly newDeparture?: Cas1NewDeparture,
    title: string = 'Record a departure',
  ) {
    super(title)

    if (this.newDeparture) {
      const [isoDate, hours, minutes] = this.newDeparture.departureDateTime.split(/T|:/)
      this.departureDate = isoDate
      this.departureTime = `${hours}:${minutes}`
    }
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

  completeForm(reasonId?: string) {
    this.clearAndCompleteDateInputs('departureDate', this.departureDate)
    this.clearAndCompleteTextInputById('departureTime', this.departureTime)
    this.checkRadioByNameAndValue('reasonId', reasonId || this.newDeparture.reasonId)
  }

  shouldShowPopulatedForm(reasonId?: string) {
    this.dateInputsShouldContainDate('departureDate', this.departureDate)
    this.verifyTextInputContentsById('departureTime', this.departureTime)
    this.verifyRadioInputByName('reasonId', reasonId || this.newDeparture.reasonId)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking) {
    cy.visit(
      paths.premises.placements.departure.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
      {
        failOnStatusCode: false,
      },
    )

    return new DepartureNewPage(placement, undefined, `Authorisation Error`)
  }
}
