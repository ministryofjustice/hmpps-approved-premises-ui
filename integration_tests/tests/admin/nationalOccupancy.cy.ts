import { cas1NationalOccupancyFactory, cruManagementAreaFactory } from '../../../server/testutils/factories'
import { signIn } from '../signIn'
import { CRU_AREA_WOMENS } from '../../../server/utils/admin/nationalOccupancyUtils'
import NationalViewPage from '../../pages/admin/nationaOccupancy/nationalViewPage'
import ListPage from '../../pages/admin/placementApplications/listPage'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('National occupancy view', () => {
  const cruManagementAreas = [
    ...cruManagementAreaFactory.buildList(5),
    cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS }),
  ]

  const filterSettings = {
    postcode: 'SW1A',
    arrivalDate: '12/9/2024',
    apArea: cruManagementAreas[3].id,
    apType: 'normal',
    apCriteria: ['isCatered'],
    roomCriteria: ['isWheelchairDesignated'],
  }

  const nationalOccupancy = cas1NationalOccupancyFactory.build()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [], status: 'notMatched' })
    cy.task('stubNationalOccupancy', { nationalOccupancy })
  })

  it('allows me to set up filters for the national view', () => {
    GIVEN('that I sign in as a cru member with national occupancy view permissions')
    signIn('cru_member', { permissions: ['cas1_view_cru_dashboard', 'cas1_national_occupancy_view'] }) // TODO: Remove explicit permissions

    GIVEN('that I am on the CRU dashboard page')
    const cruDashboard = ListPage.visit()

    WHEN('I select the action to view national availability')
    cruDashboard.clickAction('View all approved premises spaces')

    THEN('I should be on the national availability view page')
    const viewPage = new NationalViewPage()
    viewPage.checkOnPage()

    AND('the filter should be at the default settings')
    viewPage.verifyDefaultSettings()

    WHEN('I set invalid filters and submit')
    viewPage.setInvalidFilters()
    viewPage.clickButton('Apply filters')

    THEN('I should see validation errors')
    viewPage.shouldSeeValidationErrors()

    WHEN('I set valid filters')
    viewPage.setValidFilters(filterSettings)
    viewPage.clickButton('Apply filters')

    THEN('the form should be populated with the correct data')
    viewPage.submitCheckQueryParameters(filterSettings)
    viewPage.verifyFiltersPopulated(filterSettings)

    AND('the calendar should be populated')
    viewPage.verifyCalendarHeading(nationalOccupancy, '2024-09-12')
    viewPage.verifyCalendarRendered(nationalOccupancy, filterSettings.postcode)

    WHEN('I click next week')
    viewPage.clickLink('Next week')

    THEN('I should see the calendar for the following week')
    viewPage.verifyCalendarHeading(nationalOccupancy, '2024-09-19')

    WHEN('I click previous week')
    viewPage.clickLink('Previous week')

    THEN('I should see the calendar for the original week')
    viewPage.verifyCalendarHeading(nationalOccupancy, '2024-09-12')

    WHEN('I revisit the page with no query parameters')
    const noQueryPage = NationalViewPage.visit()

    THEN('the filter should still be populated (from the session)')
    noQueryPage.verifyFiltersPopulated(filterSettings)
  })

  it('denies access to the view if user lacks permission', () => {
    cy.log('Given I am signed in as a user with CRU dashboard permissions but without occupancy view permission')
    signIn('cru_member', { permissions: ['cas1_view_cru_dashboard'] })

    WHEN('I navigate to the CRU dashboard')
    const cruDashboard = ListPage.visit()

    THEN('the action menu should not be shown')
    cruDashboard.actionMenuShouldNotExist()

    WHEN('I try to navigate to the view directly - Then I should not have access')
    NationalViewPage.visitUnauthorised()
  })
})
