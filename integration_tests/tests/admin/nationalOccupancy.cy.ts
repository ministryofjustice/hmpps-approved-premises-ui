import { cruManagementAreaFactory } from '../../../server/testutils/factories'
import { signIn } from '../signIn'
import { CRU_AREA_WOMENS } from '../../../server/utils/admin/nationalOccupancyUtils'
import NationalViewPage from '../../pages/admin/nationaOccupancy/nationalViewPage'
import ListPage from '../../pages/admin/placementApplications/listPage'

context('National occupancy view', () => {
  const cruManagementAreas = [
    ...cruManagementAreaFactory.buildList(5),
    cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS }),
  ]

  const filterSettings = {
    postcodeArea: 'SW13A',
    arrivalDate: '12/9/2024',
    apArea: cruManagementAreas[3].id,
    apType: 'pipe',
    apCharacteristics: ['isCatered'],
    roomCharacteristics: ['isWheelchairDesignated'],
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [], status: 'notMatched' })
  })

  it('allows me to set up filters for the national view', () => {
    cy.log('Given that I sign in as a cru member with national occupancy view permissions')
    signIn('cru_member', { permissions: ['cas1_view_cru_dashboard', 'cas1_national_occupancy_view'] }) // TODO: Remove explicit permissions

    cy.log('Given that I am on the CRU dashboard page')
    const cruDashboard = ListPage.visit()

    cy.log('When I select the action to view national availability')
    cruDashboard.clickAction('View all approved premises spaces')

    cy.log('Then I should be on the national availabiliy view page')
    const viewPage = new NationalViewPage()
    viewPage.checkOnPage()

    cy.log('And the filter should be at the default settings')
    viewPage.verifyDefaultSettings()

    cy.log('When I set invalid filters and submit')
    viewPage.setInvalidFilters()
    viewPage.applyFilters()

    cy.log('Then I should see validation errors')
    viewPage.shouldSeeValidationErrors()

    cy.log('When I set valid filters')
    viewPage.setValidFilters(filterSettings)
    viewPage.submitCheckQueryParameters(filterSettings)
  })

  it('denys access to the view if user lacks permission', () => {
    cy.log('Given I am signed in as a CRU member without occupancy view permission')
    signIn('applicant', { permissions: ['cas1_view_cru_dashboard'] })

    cy.log('When I navigate to the CRU dashboard')
    const cruDashboard = ListPage.visit()

    cy.log('Then the action menu should not be shown')
    cruDashboard.actionMenuShouldNotExist()

    cy.log('When I try to navigate to the view directly - Then I should not have access')
    NationalViewPage.visitUnauthorised()
  })
})
