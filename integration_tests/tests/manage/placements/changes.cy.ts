import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { Cas1SpaceBooking, Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { signIn } from '../../signIn'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  placementRequestDetailFactory,
} from '../../../../server/testutils/factories'
import ShowPage from '../../../pages/admin/placementApplications/showPage'
import Page from '../../../pages/page'
import { ChangePlacementPage } from '../../../pages/manage/placements/changes/new'
import { filterRoomLevelCriteria } from '../../../../server/utils/match/spaceSearch'
import { DateFormats } from '../../../../server/utils/dateUtils'
import ChangePlacementConfirmPage from '../../../pages/manage/placements/changes/confirm'
import apiPaths from '../../../../server/paths/api'
import { roomCharacteristicMap } from '../../../../server/utils/characteristicsUtils'

context('Change Placement', () => {
  const expectedArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon())
  const expectedDepartureDate = DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 84))

  const premises = cas1PremisesFactory.build()

  const setupMocks = (placement: Cas1SpaceBooking, startDate?: string, endDate?: string) => {
    const placementRequestDetail = placementRequestDetailFactory
      .withSpaceBooking(cas1SpaceBookingSummaryFactory.build(placement))
      .build()
    placement.placementRequestId = placementRequestDetail.id
    const capacity = cas1PremiseCapacityFactory.build()
    cy.task('stubSinglePremises', premises)
    cy.task('stubPremiseCapacity', {
      premisesId: premises.id,
      premiseCapacity: capacity,
      startDate: startDate || placement.expectedArrivalDate,
      endDate: endDate || placement.expectedDepartureDate,
    })
    cy.task('stubPlacementRequest', placementRequestDetail)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubSpaceBookingUpdate', { premisesId: premises.id, placementId: placement.id })
    return { placement, placementRequestDetail }
  }

  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member with Beta access
    signIn('cru_member_find_and_book_beta')
  })

  it('allows me to change the dates and criteria of a space booking', () => {
    const placement = cas1SpaceBookingFactory.upcoming().build({
      premises: { name: premises.name, id: premises.id },
      expectedArrivalDate,
      expectedDepartureDate,
    })
    const { placementRequestDetail } = setupMocks(placement)
    // When I visit a placement request
    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    // When I click on the amend booking button
    placementRequestPage.clickAction('Change placement')

    // Then I should see the Change Placement page
    const changePlacementPage = Page.verifyOnPage(ChangePlacementPage, placement)

    // And I should see an overview of the placement
    changePlacementPage.shouldShowPlacementOverview()

    // And I should see the filter form with default populated values from the placement
    const selectedCriteria = filterRoomLevelCriteria(placement.characteristics)
    const selectedCriteriaLabels = selectedCriteria.map(criterion => roomCharacteristicMap[criterion])
    changePlacementPage.shouldShowFilters(placement.expectedArrivalDate, 'Up to 12 weeks', selectedCriteriaLabels)

    // And I can see the currently selected room criteria
    changePlacementPage.shouldShowSelectedCriteria(selectedCriteriaLabels)

    // And I can see the current placement dates in the hints
    changePlacementPage.shouldShowDateFieldHint(
      'arrivalDate',
      `Current arrival date: ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'dateFieldHint' })}`,
    )
    changePlacementPage.shouldShowDateFieldHint(
      'departureDate',
      `Current departure date: ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
    )

    // When I submit the filters with an invalid date
    changePlacementPage.filterAvailability({ newStartDate: '2025-14-45', newDuration: 'Up to 1 week' }, 'criteria')

    // Then I should see an error
    changePlacementPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    // When I update the filters with valid selections
    const criteria = ['isWheelchairDesignated', 'isStepFreeDesignated']
    const newCriteriaLabels = criteria.map(criterion => roomCharacteristicMap[criterion])
    const newFilters = {
      newStartDate: placement.expectedArrivalDate,
      newDuration: 'Up to 12 weeks',
      newCriteria: newCriteriaLabels,
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

  it('allows me to extend the end date of placement after arrival', () => {
    const actualArrivalDate = DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 20))
    const arrivedPlacement = cas1SpaceBookingFactory.upcoming().build({
      premises: { name: premises.name, id: premises.id },
      expectedArrivalDate,
      expectedDepartureDate: DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 45)),
      actualArrivalDate,
    })
    const newDepartureDate = DateFormats.dateObjToIsoDate(addDays(arrivedPlacement.expectedDepartureDate, 5))

    const { placementRequestDetail } = setupMocks(
      arrivedPlacement,
      actualArrivalDate,
      DateFormats.dateObjToIsoDate(addDays(actualArrivalDate, 56)),
    )
    // When I visit a placement request

    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    // When I click on the amend booking button
    placementRequestPage.clickAction('Change placement')

    // Then I should see the Change Placement page
    const page = Page.verifyOnPage(ChangePlacementPage, arrivedPlacement)

    // And I should see an overview of the placement
    page.shouldShowPlacementOverview()

    // And I can see the calendar for the rounded-up period in the duration selector, from the actual arrival date
    page.shouldShowCalendarHeading(actualArrivalDate, 56)

    // And I can see the current placement dates in the departure date hint
    page.shouldShowDateFieldHint(
      'departureDate',
      `Current departure date: ${DateFormats.isoDateToUIDate(arrivedPlacement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
    )
    // And I should only be able to change the departure date
    cy.get('h2').contains('Change placement')

    // When I set a new departure date and submit
    page.clearAndCompleteDateInputs('departureDate', newDepartureDate)
    page.clickContinue()

    // Then I should see the confirmation page with the correct dates
    const confirmPage = Page.verifyOnPage(ChangePlacementConfirmPage, premises, {
      arrivalDate: arrivedPlacement.expectedArrivalDate,
      departureDate: DateFormats.dateObjToIsoDate(addDays(arrivedPlacement.expectedDepartureDate, 5)),
      criteria: arrivedPlacement.characteristics.filter(characteristic => roomCharacteristicMap[characteristic]),
    })
    confirmPage.shouldShowProposedChanges(arrivedPlacement.actualArrivalDate)

    // When I submit the confirmation page
    confirmPage.clickSubmit()

    // Then I should see the placement request page again with a success banner
    Page.verifyOnPage(ShowPage, placementRequestDetail)

    placementRequestPage.shouldShowBanner('Booking changed successfully')

    // And the booking changes should have been sent to the API
    cy.task('verifyApiPatch', apiPaths.premises.placements.show).then(body => {
      const { characteristics, arrivalDate, departureDate } = body as Cas1UpdateSpaceBooking

      expect(arrivalDate).equal(undefined)
      expect(departureDate).equal(newDepartureDate)
      expect(characteristics.sort()).to.deep.equal(
        arrivedPlacement.characteristics.filter(characteristic => roomCharacteristicMap[characteristic]).sort(),
      )
    })
  })
})
