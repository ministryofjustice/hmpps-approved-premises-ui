import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { SpaceSearchFormData } from '@approved-premises/ui'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { signIn } from '../signIn'
import ShowPage from '../../pages/admin/placementApplications/showPage'
import { cas1PlacementRequestDetailFactory, spaceSearchResultsFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import NewPlacementPage from '../../pages/match/newPlacement/newPlacementPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import CheckCriteriaPage from '../../pages/match/newPlacement/checkCriteriaPage'
import UpdateCriteriaPage from '../../pages/match/newPlacement/updateCriteriaPage'
import SearchPage from '../../pages/match/searchPage'

context('New Placement', () => {
  let placementRequest: Cas1PlacementRequestDetail

  beforeEach(() => {
    cy.task('reset')

    placementRequest = cas1PlacementRequestDetailFactory.build({
      type: 'normal',
      essentialCriteria: ['isCatered', 'isWheelchairDesignated', 'isStepFreeDesignated'],
    })
    cy.task('stubPlacementRequest', placementRequest)

    const spaceSearchResults = spaceSearchResultsFactory.build()
    cy.task('stubSpaceSearch', spaceSearchResults)
  })

  it('allows me to create a new placement', () => {
    const newPlacementArrivalDate = faker.date.future()
    const newPlacementDepartureDate = addDays(newPlacementArrivalDate, 10)
    const arrivalDateValue = DateFormats.dateObjtoUIDate(newPlacementArrivalDate, { format: 'datePicker' })
    const departureDateValue = DateFormats.dateObjtoUIDate(newPlacementDepartureDate, { format: 'datePicker' })
    const reason = faker.word.words(10)

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
    newPlacementPage.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate', 'reason'], {
      arrivalDate: 'Enter or select an arrival date',
      departureDate: 'Enter or select a departure date',
      reason: 'Enter a reason',
    })

    WHEN('I complete the form')
    newPlacementPage.completeForm({ arrivalDate: arrivalDateValue, departureDate: departureDateValue, reason })
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
      startDate: DateFormats.dateObjToIsoDate(newPlacementArrivalDate),
      arrivalDate: DateFormats.dateObjToIsoDate(newPlacementArrivalDate),
      departureDate: DateFormats.dateObjToIsoDate(newPlacementDepartureDate),
      newPlacementReason: reason,
      newPlacementCriteriaChanged: false,
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
    newPlacementPage.shouldBePopulated({ arrivalDate: arrivalDateValue, departureDate: departureDateValue, reason })

    WHEN('I click the back link')
    newPlacementPage.clickBack()

    THEN('I should see the placement request page')
    Page.verifyOnPage(ShowPage, placementRequest)

    WHEN("I click on the 'Create New Placement' action")
    placementRequestPage.clickAction('Create new placement')

    THEN('I should see the page to create a new placement')
    Page.verifyOnPage(NewPlacementPage, placementRequest)

    AND('the form should be populated')
    newPlacementPage.shouldBePopulated({ arrivalDate: arrivalDateValue, departureDate: departureDateValue, reason })

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
      apCriteria: ['isCatered'],
      roomCriteria: ['isWheelchairDesignated', 'isArsonSuitable'],
    })
    updateCriteriaPage.clickButton('Save and continue')

    THEN('I should see the suitability search page with the new placement information')
    Page.verifyOnPage(SearchPage)

    // Add a test for filtering results or consider this covered in main suitability search integration test?

    WHEN('I click on a result')
    THEN('I should see the occupancy view for the premises with the new placement information')

    // Add a test for filtering view or consider this covered in main occupancy view integration test?

    WHEN('I submit the form with no values')
    THEN('I should see error messages')

    WHEN('I complete the form')
    THEN('I should see the page to confirm the new placement')

    WHEN('I confirm the new placement')
    THEN('I should see the placement request page')
    AND('I should see a confirmation banner')
    AND('The new placement details should be shown')
  })
})
