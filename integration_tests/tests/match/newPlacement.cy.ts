import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { SpaceSearchFormData } from '@approved-premises/ui'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { signIn } from '../signIn'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import {
  cas1PlacementRequestDetailFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  personFactory,
  spaceSearchResultsFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import NewPlacementPage from '../../pages/match/newPlacement/newPlacementPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import CheckCriteriaPage from '../../pages/match/newPlacement/checkCriteriaPage'
import UpdateCriteriaPage from '../../pages/match/newPlacement/updateCriteriaPage'
import SearchPage from '../../pages/match/searchPage'
import OccupancyViewPage from '../../pages/match/occupancyViewPage'
import BookASpacePage from '../../pages/match/bookASpacePage'

context('New Placement', () => {
  const newArrivalDate = faker.date.future()
  const newDepartureDate = addDays(newArrivalDate, 10)

  const newPlacementArrivalDate = DateFormats.dateObjtoUIDate(newArrivalDate, { format: 'datePicker' })
  const newPlacementDepartureDate = DateFormats.dateObjtoUIDate(newDepartureDate, { format: 'datePicker' })
  const newPlacementReason = faker.word.words(10)

  const placementRequest = cas1PlacementRequestDetailFactory.withSpaceBooking().build({
    person: personFactory.build({ type: 'FullPerson', name: 'Dave Watts' }),
    type: 'normal',
    essentialCriteria: ['isCatered', 'isWheelchairDesignated', 'isStepFreeDesignated'],
  })
  const spaceSearchResults = spaceSearchResultsFactory.build()
  const chosenResult = spaceSearchResults.results[1]
  const premises = cas1PremisesFactory.build({ ...chosenResult.premises, localRestrictions: [] })
  const capacity = cas1PremiseCapacityFactory.build({
    startDate: DateFormats.dateObjToIsoDate(newArrivalDate),
    endDate: DateFormats.dateObjToIsoDate(addDays(newDepartureDate, -1)),
  })
  const newPlacement = cas1SpaceBookingFactory.upcoming().build({
    placementRequestId: placementRequest.id,
    person: placementRequest.person,
    expectedArrivalDate: '2026-02-28',
    expectedDepartureDate: '2026-04-10',
    premises: { name: 'Premises name', id: 'some-id' },
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      premiseCapacity: capacity,
      startDate: capacity.startDate,
      endDate: capacity.endDate,
    })
    cy.task('stubSpaceBookingCreate', { placementRequestId: placementRequest.id, spaceBooking: newPlacement })
  })

  it('allows me to create a new placement', () => {
    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')

    WHEN('I view a placement request')
    const placementRequestPage = ShowPage.visit(placementRequest)

    AND("I click on the 'Create New Placement' action")
    placementRequestPage.clickAction('Create new placement')

    THEN('I should see the page to create a new placement')
    const newPlacementPage = Page.verifyOnPage(NewPlacementPage, placementRequest)

    WHEN('I submit the form with no values')
    newPlacementPage.clickButton('Save and continue')

    THEN('I should see error messages')
    newPlacementPage.shouldShowErrorMessagesForFields(
      ['newPlacementArrivalDate', 'newPlacementDepartureDate', 'newPlacementReason'],
      {
        newPlacementArrivalDate: 'Enter or select an arrival date',
        newPlacementDepartureDate: 'Enter or select a departure date',
        newPlacementReason: 'Enter a reason',
      },
    )

    WHEN('I complete the form')
    newPlacementPage.completeForm({
      newPlacementArrivalDate,
      newPlacementDepartureDate,
      newPlacementReason,
    })
    newPlacementPage.clickButton('Save and continue')

    THEN('I should see the page to check placement criteria')
    const checkCriteriaPage = Page.verifyOnPage(CheckCriteriaPage, placementRequest)

    WHEN('I submit the form with no values')
    checkCriteriaPage.clickButton('Save and continue')

    THEN('I should see an error message')
    checkCriteriaPage.shouldShowErrorMessagesForFields(['criteriaChanged'], {
      criteriaChanged: 'Select if the criteria have changed',
    })

    WHEN('I complete the form and say the criteria have not changed')
    checkCriteriaPage.checkRadioByLabel('No')
    checkCriteriaPage.clickButton('Save and continue')

    THEN('I should see the suitability search page with the new placement information')
    const searchPage = Page.verifyOnPage(SearchPage)
    const expectedSearchFormData: SpaceSearchFormData = {
      postcode: placementRequest.location,
      startDate: DateFormats.dateObjToIsoDate(newArrivalDate),
      newPlacementArrivalDate: DateFormats.dateObjToIsoDate(newArrivalDate),
      newPlacementDepartureDate: DateFormats.dateObjToIsoDate(newDepartureDate),
      newPlacementReason,
      newPlacementCriteriaChanged: 'no',
      apType: 'normal',
      apCriteria: ['isCatered'],
      roomCriteria: ['isWheelchairDesignated', 'isStepFreeDesignated'],
    }
    searchPage.shouldShowNewPlacementDetails(expectedSearchFormData)
    searchPage.shouldShowSearchParametersInInputs(expectedSearchFormData)

    WHEN('I click the back link')
    searchPage.clickBack()

    THEN('I should see the page to check placement criteria')
    Page.verifyOnPage(CheckCriteriaPage, placementRequest)

    AND('the form should be populated')
    checkCriteriaPage.verifyRadioByLabel('No', true)

    WHEN('I click the back link')
    checkCriteriaPage.clickBack()

    THEN('I should see the page to create a new placement')
    Page.verifyOnPage(NewPlacementPage, placementRequest)

    AND('the form should be populated')
    newPlacementPage.shouldBePopulated({
      newPlacementArrivalDate,
      newPlacementDepartureDate,
      newPlacementReason,
    })

    WHEN('I click the back link')
    newPlacementPage.clickBack()

    THEN('I should see the placement request page')
    Page.verifyOnPage(ShowPage, placementRequest)

    WHEN("I click on the 'Create New Placement' action")
    placementRequestPage.clickAction('Create new placement')

    THEN('I should see the page to create a new placement')
    Page.verifyOnPage(NewPlacementPage, placementRequest)

    AND('the form should be populated')
    newPlacementPage.shouldBePopulated({
      newPlacementArrivalDate,
      newPlacementDepartureDate,
      newPlacementReason,
    })

    WHEN('I submit the form')
    newPlacementPage.clickButton('Save and continue')

    THEN('I should see the page to check placement criteria')
    Page.verifyOnPage(CheckCriteriaPage, placementRequest)

    AND('the form should be populated')
    checkCriteriaPage.verifyRadioByLabel('No', true)

    WHEN('I confirm the criteria have changed')
    checkCriteriaPage.checkRadioByLabel('Yes')
    checkCriteriaPage.clickButton('Save and continue')

    THEN('I should see the form to update placement criteria')
    const updateCriteriaPage = Page.verifyOnPage(UpdateCriteriaPage, placementRequest)

    WHEN('I complete the form')
    updateCriteriaPage.completeForm({
      typeOfAp: 'isPIPE',
      apCriteria: ['acceptsChildSexOffenders'],
      roomCriteria: ['isArsonSuitable'],
    })
    updateCriteriaPage.clickButton('Save and continue')

    THEN('I should see the suitability search page with the new placement information')
    Page.verifyOnPage(SearchPage)
    const expectedSearchFormDataAfterUpdate: SpaceSearchFormData = {
      postcode: placementRequest.location,
      startDate: DateFormats.dateObjToIsoDate(newArrivalDate),
      newPlacementArrivalDate,
      newPlacementDepartureDate,
      newPlacementReason,
      newPlacementCriteriaChanged: 'no',
      apType: 'isPIPE',
      apCriteria: ['acceptsChildSexOffenders'],
      roomCriteria: ['isArsonSuitable'],
    }
    searchPage.shouldShowNewPlacementDetails(expectedSearchFormDataAfterUpdate)
    searchPage.shouldShowSearchParametersInInputs(expectedSearchFormDataAfterUpdate)

    AND('it should not show an option to mark as unable to match')
    searchPage.shouldNotShow('Mark this case as unable to book')
    searchPage.shouldNotShow('Unable to book', 'button')

    WHEN('I click on a result')
    searchPage.clickSearchResult(chosenResult)

    THEN('I should see the occupancy view for the premises with the new placement information')
    const occupancyViewPage = Page.verifyOnPage(OccupancyViewPage, chosenResult.premises.name)
    occupancyViewPage.shouldShowNewPlacementDetails(expectedSearchFormDataAfterUpdate)

    AND('it should not show an option to mark as unable to match')
    searchPage.shouldNotShow('Mark as unable to book', 'a')

    WHEN('I submit the new placement dates')
    occupancyViewPage.completeForm(
      DateFormats.dateObjToIsoDate(newArrivalDate),
      DateFormats.dateObjToIsoDate(newDepartureDate),
    )

    WHEN('I submit the form')
    occupancyViewPage.clickButton('Continue')

    THEN('I should see the page to confirm the new placement with the new placement information')
    const confirmBookingPage = Page.verifyOnPage(BookASpacePage)
    confirmBookingPage.shouldShowBookingDetails(
      placementRequest,
      chosenResult.premises,
      DateFormats.dateObjToIsoDate(newArrivalDate),
      DateFormats.dateObjToIsoDate(newDepartureDate),
      expectedSearchFormDataAfterUpdate.roomCriteria,
      newPlacementReason,
    )

    WHEN('I confirm the new placement')
    const newPlacementSummary = cas1SpaceBookingSummaryFactory.build(newPlacement)
    cy.task('stubPlacementRequest', {
      ...placementRequest,
      spaceBookings: [...placementRequest.spaceBookings, newPlacementSummary],
    })
    confirmBookingPage.clickButton('Confirm and book')

    THEN('I should see the placement request page')
    Page.verifyOnPage(ShowPage, placementRequest)

    AND('I should see a confirmation banner')
    placementRequestPage.shouldShowBanner(`
      Placement created
      A placement has been created for Dave Watts at Premises name from Sat 28 Feb 2026 to Fri 10 Apr 2026.
      The original placement requires changes to the departure date.
    `)

    AND('The new placement details should be shown')
    placementRequestPage.shouldShowBookingInformation([...placementRequest.spaceBookings, newPlacementSummary])
  })
})
