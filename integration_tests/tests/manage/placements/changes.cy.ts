import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { signIn } from '../../signIn'
import {
  bookingSummaryFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  placementRequestDetailFactory,
} from '../../../../server/testutils/factories'
import ShowPage from '../../../pages/admin/placementApplications/showPage'
import Page from '../../../pages/page'
import { ChangePlacementPage } from '../../../pages/manage/placements/changes/new'
import { fullPersonFactory } from '../../../../server/testutils/factories/person'
import { filterRoomLevelCriteria } from '../../../../server/utils/match/spaceSearch'
import { DateFormats } from '../../../../server/utils/dateUtils'
import ChangePlacementConfirmPage from '../../../pages/manage/placements/changes/confirm'
import { occupancyCriteriaMap } from '../../../../server/utils/match/occupancy'
import apiPaths from '../../../../server/paths/api'

context('Change Placement', () => {
  const expectedArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon())
  const expectedDepartureDate = DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 84))

  const person = fullPersonFactory.build()
  const premises = cas1PremisesFactory.build()
  const placement = cas1SpaceBookingFactory.upcoming().build({
    premises: { name: premises.name, id: premises.id },
    expectedArrivalDate,
    expectedDepartureDate,
  })
  const placementRequestDetail = placementRequestDetailFactory.build({
    person,
    status: 'matched',
    booking: bookingSummaryFactory.fromSpaceBooking(placement).build(),
  })
  placement.requestForPlacementId = placementRequestDetail.id
  const capacity = cas1PremiseCapacityFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am signed in
    signIn(['workflow_manager', 'future_manager'], ['cas1_space_booking_create'])

    cy.task('stubSinglePremises', premises)
    cy.task('stubPremiseCapacity', {
      premisesId: premises.id,
      premiseCapacity: capacity,
      startDate: placement.expectedArrivalDate,
      endDate: placement.expectedDepartureDate,
      excludeSpaceBookingId: placement.id,
    })
    cy.task('stubPlacementRequest', placementRequestDetail)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubSpaceBookingUpdate', { premisesId: premises.id, placementId: placement.id })
  })

  it('allows me to change the dates and criteria of a space booking', () => {
    // When I visit a placement request
    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    // When I click on the amend booking button
    placementRequestPage.clickAction('Change placement dates')

    // Then I should see the Change Placement page
    const changePlacementPage = Page.verifyOnPage(ChangePlacementPage, placement)

    // And I should see an overview of the placement
    changePlacementPage.shouldShowPlacementOverview()

    // And I should see the filter form with default populated values from the placement
    const selectedCriteria = filterRoomLevelCriteria(placement.requirements.essentialCharacteristics).map(
      criterion => occupancyCriteriaMap[criterion],
    )
    changePlacementPage.shouldShowFilters(placement.expectedArrivalDate, 'Up to 12 weeks', selectedCriteria)

    // When I submit the filters with an invalid date
    changePlacementPage.filterAvailability({ newStartDate: '2025-14-45', newDuration: 'Up to 1 week' }, 'criteria')

    // Then I should see an error
    changePlacementPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    // When I update the filters with valid selections
    const newFilters = {
      newStartDate: placement.expectedArrivalDate,
      newDuration: 'Up to 12 weeks',
      newCriteria: ['Wheelchair accessible', 'Step-free'],
    }
    changePlacementPage.filterAvailability(newFilters, 'criteria')

    // Then I should see updated availability information
    changePlacementPage.shouldShowFilters(newFilters.newStartDate, newFilters.newDuration, newFilters.newCriteria)

    // When I submit invalid updated dates for the booking
    changePlacementPage.completeForm('', '2025-14-45')
    changePlacementPage.clickContinue()

    // Then I should see some errors
    changePlacementPage.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'], {
      arrivalDate: 'You must enter an arrival date',
      departureDate: 'The departure date is an invalid date',
    })

    // When I submit valid updated dates for the booking
    const arrivalDate = DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 2))
    const departureDate = DateFormats.dateObjToIsoDate(addDays(expectedDepartureDate, 2))
    const criteria = ['isWheelchairDesignated', 'isStepFreeDesignated']
    changePlacementPage.completeForm(arrivalDate, departureDate)
    changePlacementPage.clickContinue()

    // Then I should see the confirmation page
    const changePlacementConfirmPage = Page.verifyOnPage(ChangePlacementConfirmPage, premises, {
      arrivalDate,
      departureDate,
      criteria,
    })

    // And I should see the changes I am submitting
    changePlacementConfirmPage.shouldShowProposedChanges()

    // When I submit the confirmation page
    changePlacementConfirmPage.clickSubmit()

    // Then I should see the placement request page again with a success banner
    Page.verifyOnPage(ShowPage, placementRequestDetail)

    placementRequestPage.shouldShowBanner('Booking changed successfully')

    // And the booking changes should have been sent to the API
    cy.task('verifyApiPatch', apiPaths.premises.placements.show).then(body => {
      expect(body).to.deep.equal({
        arrivalDate,
        departureDate,
        characteristics: criteria,
      })
    })
  })
})
