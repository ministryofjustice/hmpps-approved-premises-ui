import { ArrivalCreatePage, PremisesShowPage } from '../../pages/manage'

import {
  arrivalFactory,
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  staffMemberFactory,
} from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'
import { signIn } from '../signIn'

const staff = staffMemberFactory.buildList(5, { keyWorker: true })

context('Arrivals', () => {
  beforeEach(() => {
    cy.task('reset')
    signIn(['workflow_manager'])
  })

  it('creates an arrival', () => {
    // Given I have a booking for a premises
    const premises = extendedPremisesSummaryFactory.build({ dateCapacities: dateCapacityFactory.buildList(5) })
    const bookingId = 'some-uuid'
    const arrivalDateObj = new Date(2022, 1, 11, 12, 35)
    const arrival = arrivalFactory.build({
      arrivalDate: DateFormats.dateObjToIsoDate(arrivalDateObj),
      arrivalTime: DateFormats.timeFromDate(arrivalDateObj),
      expectedDepartureDate: '2022-12-11',
    })

    cy.task('stubPremisesStaff', { premisesId: premises.id, staff })
    cy.task('stubPremisesSummary', premises)
    cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId, arrival })

    // When I mark the booking as having arrived
    const page = ArrivalCreatePage.visit(premises.id, bookingId)
    page.completeArrivalForm(arrival, staff[0].code)

    // Then an arrival should be created in the API
    cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const { arrivalDate, arrivalTime, expectedDepartureDate } = arrival
      const arrivalDateTime = `${arrivalDate}T${arrivalTime}:00.000Z`

      expect(requestBody.notes).equal(arrival.notes)
      expect(requestBody.arrivalDateTime).equal(arrivalDateTime)
      expect(requestBody.keyWorkerStaffCode).equal(staff[0].code)
      expect(requestBody.expectedDepartureDate).equal(expectedDepartureDate)
    })

    // And I should be redirected to the premises page
    const premisesPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    premisesPage.shouldShowBanner('Arrival logged')
  })

  it('show arrival errors when the API returns an error', () => {
    // Given I have a booking for a premises
    const premises = extendedPremisesSummaryFactory.build()
    const bookingId = 'some-uuid'

    cy.task('stubPremisesSummary', premises)
    cy.task('stubPremisesStaff', { premisesId: premises.id, staff })

    // When I visit the arrivals page
    const page = ArrivalCreatePage.visit(premises.id, bookingId)

    // And I miss a required field
    cy.task('stubArrivalErrors', {
      premisesId: premises.id,
      bookingId,
      params: ['expectedDepartureDate', 'keyWorkerStaffCode'],
    })
    page.submitArrivalFormWithoutFields()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['expectedDepartureDate', 'keyWorkerStaffCode'])
  })
})
