import type { Cas1NewArrival, Cas1SpaceBooking } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import apiPaths from '../../../../server/paths/api'

export class ArrivalCreatePage extends Page {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Record someone as arrived')
  }

  private arrivalDateTime = DateFormats.dateObjToIsoDateTime(faker.date.recent())

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
    this.completeDateInputs('arrivalDateTime', DateFormats.isoDateTimeToIsoDate(this.arrivalDateTime))
    this.completeTextInput('arrivalTime', DateFormats.isoDateTimeToTime(this.arrivalDateTime))
  }

  checkApiCalled(): void {
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.arrival({ premisesId: this.placement.premises.id, placementId: this.placement.id }),
    ).then(body => {
      const { arrivalDate, arrivalTime } = body as Cas1NewArrival
      expect(arrivalDate).equal(DateFormats.isoDateTimeToIsoDate(this.arrivalDateTime))
      expect(arrivalTime).equal(DateFormats.isoDateTimeToTime(this.arrivalDateTime))
    })
  }
}
