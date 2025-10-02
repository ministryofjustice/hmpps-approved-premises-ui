import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { Cas1UpdateSpaceBooking, FullPerson } from '@approved-premises/api'
import { signIn } from '../../signIn'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  cas1PlacementRequestDetailFactory,
} from '../../../../server/testutils/factories'
import ShowPage from '../../../pages/admin/placementApplications/showPage'
import Page from '../../../pages/page'
import { ChangePlacementPage } from '../../../pages/manage/placements/changes/new'
import { filterRoomLevelCriteria } from '../../../../server/utils/match/spaceSearch'
import { DateFormats } from '../../../../server/utils/dateUtils'
import ChangePlacementConfirmPage from '../../../pages/manage/placements/changes/confirm'
import apiPaths from '../../../../server/paths/api'
import { roomCharacteristicMap } from '../../../../server/utils/characteristicsUtils'
import { PlacementShowPage } from '../../../pages/manage'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import { SelectPlacementPage } from '../../../pages/manage/placements/changes/selectPlacement'
import { placementTitle } from '../../../../server/utils/placementRequests/placementSummaryList'

context('Change Placement', () => {
  const setupPlacement = (status = 'upcoming', placementRequestId?: string) => {
    const expectedArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon())
    const expectedDepartureDate = DateFormats.dateObjToIsoDate(addDays(expectedArrivalDate, 84))

    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory[status]().build({
      placementRequestId,
      premises: { name: premises.name, id: premises.id },
      expectedArrivalDate,
      expectedDepartureDate,
    })
    const startDate = placement.actualArrivalDate || placement.expectedArrivalDate
    const endDate = DateFormats.dateObjToIsoDate(addDays(placement.expectedDepartureDate, -1))
    const capacity = cas1PremiseCapacityFactory.build({
      startDate,
      endDate,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      premiseCapacity: capacity,
      startDate,
      endDate,
    })

    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubSpaceBookingUpdate', { premisesId: premises.id, placementId: placement.id })
    return { placement, premises }
  }

  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')
  })

  it('allows me to change the dates and criteria of a space booking', () => {
    const { placement, premises } = setupPlacement('upcoming', faker.string.uuid())
    const placementRequestDetail = cas1PlacementRequestDetailFactory
      .withSpaceBooking(placement)
      .build({ id: placement.placementRequestId })
    cy.task('stubPlacementRequest', placementRequestDetail)

    WHEN('I visit a placement request')
    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    WHEN('I click on the Change placement action')
    placementRequestPage.clickAction('Change placement')

    THEN('I should see the Change Placement page')
    const changePlacementPage = Page.verifyOnPage(ChangePlacementPage, placement)

    AND('I should see the details of the person')
    changePlacementPage.shouldShowKeyPersonDetails(placement.person as FullPerson, placement.tier)

    AND('I should see an overview of the placement')
    changePlacementPage.shouldShowPlacementOverview()

    AND('I should see the filter form with default populated values from the placement')
    const selectedCriteria = filterRoomLevelCriteria(placement.characteristics)
    const selectedCriteriaLabels = selectedCriteria.map(criterion => roomCharacteristicMap[criterion])
    changePlacementPage.shouldShowFilters(placement.expectedArrivalDate, 'Up to 12 weeks', selectedCriteriaLabels)

    AND('I can see the currently selected room criteria')
    changePlacementPage.shouldShowSelectedCriteria(selectedCriteriaLabels)

    AND('I can see the current placement dates in the hints')
    changePlacementPage.shouldShowDateFieldHint(
      'arrivalDate',
      `Current arrival date: ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'dateFieldHint' })}`,
    )
    changePlacementPage.shouldShowDateFieldHint(
      'departureDate',
      `Current departure date: ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
    )

    WHEN('I submit the filters with an invalid date')
    changePlacementPage.filterAvailability({ newStartDate: '2025-14-45', newDuration: 'Up to 1 week' }, 'criteria')

    THEN('I should see an error')
    changePlacementPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    WHEN('I update the filters with valid selections')
    const criteria = ['isWheelchairDesignated', 'isStepFreeDesignated']
    const newCriteriaLabels = criteria.map(criterion => roomCharacteristicMap[criterion])
    const newFilters = {
      newStartDate: placement.expectedArrivalDate,
      newDuration: 'Up to 12 weeks',
      newCriteria: newCriteriaLabels,
    }
    changePlacementPage.filterAvailability(newFilters, 'criteria')

    THEN('I should see updated availability information')
    changePlacementPage.shouldShowFilters(newFilters.newStartDate, newFilters.newDuration, newFilters.newCriteria)

    WHEN('I submit invalid updated dates for the booking')
    changePlacementPage.completeForm('', '2025-14-45')
    changePlacementPage.clickContinue()

    THEN('I should see some errors')
    changePlacementPage.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'], {
      arrivalDate: 'You must enter an arrival date',
      departureDate: 'The departure date is an invalid date',
    })

    WHEN('I submit valid updated dates for the booking')
    const arrivalDate = DateFormats.dateObjToIsoDate(addDays(placement.expectedArrivalDate, 2))
    const departureDate = DateFormats.dateObjToIsoDate(addDays(placement.expectedDepartureDate, 2))

    changePlacementPage.completeForm(arrivalDate, departureDate)
    changePlacementPage.clickContinue()

    THEN('I should see the confirmation page')
    const changePlacementConfirmPage = Page.verifyOnPage(ChangePlacementConfirmPage, premises, {
      arrivalDate,
      departureDate,
      criteria,
    })

    AND('I should see the changes I am submitting')
    changePlacementConfirmPage.shouldShowProposedChanges()

    WHEN('I submit the confirmation page')
    changePlacementConfirmPage.clickSubmit()

    THEN('I should see the placement request page again with a success banner')
    Page.verifyOnPage(ShowPage, placementRequestDetail)

    placementRequestPage.shouldShowBanner('Booking changed successfully')

    AND('the booking changes should have been sent to the API')
    cy.task('verifyApiPatch', apiPaths.premises.placements.show).then(body => {
      expect(body).to.deep.equal({
        arrivalDate,
        departureDate,
        characteristics: criteria,
      })
    })
  })

  it('allows me to change the dates and criteria of an offline placement', () => {
    const { placement, premises } = setupPlacement('upcoming')

    WHEN('I visit an offline placement')
    const placementPage = PlacementShowPage.visit(placement)

    WHEN('I click on the Change placement action')
    placementPage.clickAction('Change placement')

    THEN('I should see the Change Placement page')
    const changePlacementPage = Page.verifyOnPage(ChangePlacementPage, placement)

    AND('I should see the details of the person')
    changePlacementPage.shouldShowKeyPersonDetails(placement.person as FullPerson, placement.tier)

    AND('I should see an overview of the placement')
    changePlacementPage.shouldShowPlacementOverview()

    WHEN('I update the filters with valid selections')
    const criteria = ['isWheelchairDesignated', 'isStepFreeDesignated']
    const newCriteriaLabels = criteria.map(criterion => roomCharacteristicMap[criterion])
    const newFilters = {
      newStartDate: placement.expectedArrivalDate,
      newDuration: 'Up to 12 weeks',
      newCriteria: newCriteriaLabels,
    }
    changePlacementPage.filterAvailability(newFilters, 'criteria')

    AND('I submit valid updated dates for the booking')
    const arrivalDate = DateFormats.dateObjToIsoDate(addDays(placement.expectedArrivalDate, 2))
    const departureDate = DateFormats.dateObjToIsoDate(addDays(placement.expectedDepartureDate, 2))

    changePlacementPage.completeForm(arrivalDate, departureDate)
    changePlacementPage.clickContinue()

    THEN('I should see the confirmation page')
    const changePlacementConfirmPage = Page.verifyOnPage(ChangePlacementConfirmPage, premises, {
      arrivalDate,
      departureDate,
      criteria,
    })

    AND('I should see the changes I am submitting')
    changePlacementConfirmPage.shouldShowProposedChanges()

    WHEN('I submit the confirmation page')
    changePlacementConfirmPage.clickSubmit()

    THEN('I should see the placement page again with a success banner')
    Page.verifyOnPage(PlacementShowPage, placement)

    placementPage.shouldShowBanner('Booking changed successfully')

    AND('the booking changes should have been sent to the API')
    cy.task('verifyApiPatch', apiPaths.premises.placements.show).then(body => {
      expect(body).to.deep.equal({
        arrivalDate,
        departureDate,
        characteristics: criteria,
      })
    })
  })

  it('allows me to extend the end date of placement after arrival', () => {
    const { placement: arrivedPlacement, premises } = setupPlacement('current', faker.string.uuid())
    const placementRequestDetail = cas1PlacementRequestDetailFactory
      .withSpaceBooking(arrivedPlacement)
      .build({ id: arrivedPlacement.placementRequestId })
    cy.task('stubPlacementRequest', placementRequestDetail)

    const newDepartureDate = DateFormats.dateObjToIsoDate(addDays(arrivedPlacement.expectedDepartureDate, 5))

    WHEN('I visit a placement request')
    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    WHEN('I click on the amend booking button')
    placementRequestPage.clickAction('Change placement')

    THEN('I should see the Change Placement page')
    const page = Page.verifyOnPage(ChangePlacementPage, arrivedPlacement)

    AND('I should see an overview of the placement')
    page.shouldShowPlacementOverview()

    AND('I can see the calendar for the period from actual arrival date to the expected departure date')
    const duration = DateFormats.durationBetweenDates(
      arrivedPlacement.actualArrivalDate,
      arrivedPlacement.expectedDepartureDate,
    ).number
    page.shouldShowCalendarHeading(arrivedPlacement.actualArrivalDate, duration)

    AND('I can see the current placement dates in the departure date hint')
    page.shouldShowDateFieldHint(
      'departureDate',
      `Current departure date: ${DateFormats.isoDateToUIDate(arrivedPlacement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
    )

    AND('I should only be able to change the departure date')
    cy.get('h2').contains('Change placement')

    WHEN('I set a new departure date and submit')
    page.clearAndCompleteDateInputs('departureDate', newDepartureDate)
    page.clickContinue()

    THEN('I should see the confirmation page with the correct dates')
    const confirmPage = Page.verifyOnPage(ChangePlacementConfirmPage, premises, {
      arrivalDate: arrivedPlacement.expectedArrivalDate,
      departureDate: DateFormats.dateObjToIsoDate(addDays(arrivedPlacement.expectedDepartureDate, 5)),
      criteria: arrivedPlacement.characteristics.filter(characteristic => roomCharacteristicMap[characteristic]),
    })
    confirmPage.shouldShowProposedChanges(arrivedPlacement.actualArrivalDate)

    WHEN('I submit the confirmation page')
    confirmPage.clickSubmit()

    THEN('I should see the placement request page again with a success banner')
    Page.verifyOnPage(ShowPage, placementRequestDetail)
    placementRequestPage.shouldShowBanner('Booking changed successfully')

    AND('the booking changes should have been sent to the API')
    cy.task('verifyApiPatch', apiPaths.premises.placements.show).then(body => {
      const { characteristics, arrivalDate, departureDate } = body as Cas1UpdateSpaceBooking

      expect(arrivalDate).equal(undefined)
      expect(departureDate).equal(newDepartureDate)
      expect(characteristics.sort()).to.deep.equal(
        arrivedPlacement.characteristics.filter(characteristic => roomCharacteristicMap[characteristic]).sort(),
      )
    })
  })

  it('asks which placement needs changing if there are more than one for the placement request', () => {
    GIVEN('There is a placement request with two placements')
    const placementRequestId = faker.string.uuid()
    const { placement: placement1 } = setupPlacement('current', placementRequestId)
    const { placement: placement2 } = setupPlacement('upcoming', placementRequestId)
    const placementRequestDetail = cas1PlacementRequestDetailFactory.matched().build({
      id: placementRequestId,
      spaceBookings: [
        cas1SpaceBookingSummaryFactory.build(placement1),
        cas1SpaceBookingSummaryFactory.build(placement2),
      ],
    })
    cy.task('stubPlacementRequest', placementRequestDetail)

    WHEN('I visit the placement request')
    const placementRequestPage = ShowPage.visit(placementRequestDetail)

    WHEN('I click on the Change placement action')
    placementRequestPage.clickAction('Change placement')

    THEN('I see the page to select the placement to change')
    const selectPlacementPage = Page.verifyOnPage(SelectPlacementPage)

    AND('I can see both placements listed')
    selectPlacementPage.shouldShowPlacementsAsRadios(placementRequestDetail.spaceBookings)

    WHEN('I submit the form without selecting a placement')
    selectPlacementPage.clickButton('Continue')

    THEN('I should see an error')
    selectPlacementPage.shouldShowErrorMessagesForFields(['placementId'], {
      placementId: 'Select a placement to change',
    })

    WHEN('I select the first placement')
    selectPlacementPage.checkRadioByLabel(placementTitle(placementRequestDetail.spaceBookings[0]))
    selectPlacementPage.clickButton('Continue')

    THEN('I should see the Change Placement page for the first placement')
    const changePlacement1Page = Page.verifyOnPage(ChangePlacementPage, placement1)
    changePlacement1Page.shouldShowPlacementOverview()

    WHEN('I click back')
    changePlacement1Page.clickBack()

    THEN('I should see the page to select the placement to change')
    Page.verifyOnPage(SelectPlacementPage)

    WHEN('I select the second placement')
    selectPlacementPage.checkRadioByLabel(placementTitle(placementRequestDetail.spaceBookings[1]))
    selectPlacementPage.clickButton('Continue')

    THEN('I should see the Change Placement page for the second placement')
    const changePlacement2Page = Page.verifyOnPage(ChangePlacementPage, placement2)
    changePlacement2Page.shouldShowPlacementOverview()
  })
})
