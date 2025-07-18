import { ApType, Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import {
  cas1NationalOccupancyFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cruManagementAreaFactory,
} from '../../../server/testutils/factories'
import { signIn } from '../signIn'
import { CRU_AREA_WOMENS } from '../../../server/utils/admin/nationalOccupancyUtils'
import NationalViewPage from '../../pages/admin/nationaOccupancy/nationalViewPage'
import ListPage from '../../pages/admin/placementApplications/listPage'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import PremisesOccupancyViewPage from '../../pages/admin/nationaOccupancy/premisesOccupancyViewPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import DayAvailabilityPage from '../../pages/match/dayAvailabilityPage'

context('National occupancy view', () => {
  const cruManagementAreas = [
    ...cruManagementAreaFactory.buildList(5),
    cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS }),
  ]

  const filterSettings: {
    postcode: string
    arrivalDate: string
    apArea: string
    apType: ApType
    apCriteria: Array<Cas1SpaceCharacteristic>
    roomCriteria: Array<Cas1SpaceBookingCharacteristic>
  } = {
    postcode: 'SW1A',
    arrivalDate: '12/9/2024',
    apArea: cruManagementAreas[3].id,
    apType: 'normal',
    apCriteria: ['isCatered'],
    roomCriteria: ['isWheelchairDesignated'],
  }

  const nationalOccupancy = cas1NationalOccupancyFactory.build({ startDate: '2024-09-12' })
  const premises = cas1PremisesFactory.build({ id: nationalOccupancy.premises[1].summary.id })

  const daySummaryDate = '2024-09-15'
  const premisesDaySummary = cas1PremisesDaySummaryFactory.build({ forDate: daySummaryDate })

  const capacities = [
    { startDate: '2024-09-12', endDate: '2024-12-05' },
    { startDate: '2024-09-12', endDate: '2024-09-19' },
    { startDate: daySummaryDate, endDate: daySummaryDate },
  ].map(capacityRange => {
    return { ...capacityRange, premiseCapacity: cas1PremiseCapacityFactory.build(capacityRange) }
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [], status: 'notMatched' })
    cy.task('stubNationalOccupancy', { nationalOccupancy })
    cy.task('stubSinglePremises', premises)
    capacities.forEach(capacity => {
      cy.task('stubPremisesCapacity', {
        premisesId: premises.id,
        ...capacity,
      })
    })

    cy.task('stubPremisesDaySummary', { premisesId: premises.id, date: daySummaryDate, premisesDaySummary })
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

  it('allows me to see details of a premises and day', () => {
    GIVEN('I am signed in as a CRU member')
    signIn('cru_member', { permissions: ['cas1_view_cru_dashboard', 'cas1_national_occupancy_view'] }) // TODO: Remove explicit permissions

    GIVEN('that I am on the National occupancy view page')
    const weekPage = NationalViewPage.visit()
    weekPage.setValidFilters(filterSettings)
    weekPage.clickButton('Apply filters')

    WHEN('I select a single AP')
    weekPage.clickLink(nationalOccupancy.premises[1].summary.name)

    THEN('I should be on the single premises view page')
    const page = new PremisesOccupancyViewPage(`View spaces in ${premises.name}`)

    AND('the default duration should be set')
    page.shouldHaveSelectText('durationDays', 'Up to 12 weeks')

    WHEN(`I change the duration to 1 week and set an invalid date`)
    page.getSelectInputByIdAndSelectAnEntry('durationDays', 'Up to 1 week')
    page.clearInput('arrivalDate')
    page.completeTextInput('arrivalDate', 'invalid')
    page.clickButton('Apply filters')

    THEN('I should see an error')
    page.shouldSeeValidationErrors()

    WHEN('I correct the invalid date')
    page.clearInput('arrivalDate')
    page.completeDatePicker('arrivalDate', capacities[1].startDate)
    page.clickButton('Apply filters')

    AND('I should see the calendar')
    page.shouldShowCalendarKey()
    page.shouldShowCalendar(capacities[1].premiseCapacity, filterSettings.roomCriteria)

    WHEN(`I change the 'filter' to no room criteria`)
    page.uncheckCheckboxbyNameAndValue('roomCriteria', 'isWheelchairDesignated')
    page.clickButton('Apply filters')

    THEN('I should see the calendar in no criteria format')
    page.shouldShowCalendarKey()
    page.shouldShowCalendar(capacities[1].premiseCapacity, [])

    WHEN('I click on a day')
    page.clickLink(DateFormats.isoDateToUIDate(daySummaryDate, { format: 'longNoYear' }))

    THEN('I should see the day details view for that day')
    const dayPage = new DayAvailabilityPage(premisesDaySummary, capacities[2].premiseCapacity.capacity[0], [])

    AND('I should see availability details')
    dayPage.shouldShowDayAvailability()

    WHEN('I click back')
    dayPage.clickBack()

    THEN('I am on the AP view page again with all my settings unchanged')
    page.checkOnPage()
    page.shouldBePopululatedWith({ durationText: 'Up to 1 week', arrivalDate: filterSettings.arrivalDate })

    WHEN('I click back')
    page.clickBack()

    THEN('I arrive back on the national week view page')
    weekPage.checkOnPage()

    AND('the changes I made to the filters should persist')
    weekPage.verifyFiltersPopulated({ ...filterSettings, roomCriteria: [] })

    WHEN('I click on a day cell')
    weekPage.clickOnDayCell(nationalOccupancy.premises[1].summary.name, 3)

    THEN('I should see the day view for that cell')
    dayPage.shouldShowDayAvailability()

    WHEN('I click back')
    dayPage.clickBack()

    THEN('I am on the AP view page again with all my settings unchanged')
    weekPage.checkOnPage()
    weekPage.verifyFiltersPopulated({ ...filterSettings, roomCriteria: [] })
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
