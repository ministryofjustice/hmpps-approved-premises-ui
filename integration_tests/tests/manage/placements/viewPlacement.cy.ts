import { Cas1SpaceBookingDates, FullPerson } from '@approved-premises/api'
import {
  applicationFactory,
  assessmentFactory,
  cas1PlacementRequestDetailFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cas1TimelineEventFactory,
  personFactory,
  restrictedPersonFactory,
} from '../../../../server/testutils/factories'

import { PlacementShowPage } from '../../../pages/manage'

import { signIn } from '../../signIn'

type Mode = 'normal' | 'lao' | 'offline'
context('Placements', () => {
  describe('show', () => {
    beforeEach(() => {
      cy.task('reset')
    })

    const setup = (placementParameters = {}, mode: Mode = 'normal') => {
      const premises = cas1PremisesBasicSummaryFactory.build()
      const person = mode === 'lao' ? restrictedPersonFactory.build() : personFactory.build()
      const application = applicationFactory.build({ person, personStatusOnSubmission: (person as FullPerson).status })
      const assessment = assessmentFactory.build()
      const placementRequest = cas1PlacementRequestDetailFactory.build()
      const placement = cas1SpaceBookingFactory.upcoming().build({
        ...placementParameters,
        applicationId: application.id,
        assessmentId: mode === 'offline' ? undefined : assessment.id,
        placementRequestId: mode === 'offline' ? undefined : placementRequest.id,
        premises: { name: premises.name, id: premises.id },
        person,
      })
      const timeline = cas1TimelineEventFactory.buildList(10)

      cy.task('stubSpaceBookingShow', placement)
      cy.task('stubApplicationGet', { application })
      cy.task('stubSpaceBookingTimeline', { premisesId: premises.id, placementId: placement.id, timeline })
      cy.task('stubPlacementRequest', placementRequest)
      cy.task('stubAssessment', assessment)
      return {
        placement,
        application,
        assessment,
        placementRequest,
        timeline,
      }
    }

    it('should show a placement', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement
      const { placement } = setup()
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see the person information in the header
      placementShowPage.shouldShowPersonHeader(placement.person as FullPerson)
      // And the placement details in the page tables
      placementShowPage.shouldShowSummaryInformation(placement)
      // And the placement details tab should be selected
      placementShowPage.shouldHaveActiveTab('Placement details')
    })

    it('should show placement details tabs', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement
      const { placement, application, assessment, timeline, placementRequest } = setup()
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // And I select the application tab
      placementShowPage.clickTab('Application')
      // Then I should see the details of the person
      placementShowPage.shouldShowPersonDetails(application.person as FullPerson)
      // And the application tab should be selected
      placementShowPage.shouldHaveActiveTab('Application')

      // When I select the assessment tab
      placementShowPage.clickTab('Assessment')
      // Then I should see the details of the assessment
      placementShowPage.shouldShowCheckYourAnswersResponses(assessment)
      // And the assessment tab should be selected
      placementShowPage.shouldHaveActiveTab('Assessment')

      // When I select the placement request tab
      placementShowPage.clickTab('Request for placement')
      // Then I should see the details of the request for placement
      placementShowPage.shouldShowPlacementRequestDetails(placementRequest)
      // And the 'request for placement' tab should be selected
      placementShowPage.shouldHaveActiveTab('Request for placement')

      // When I select the timeline tab
      placementShowPage.clickTab('Timeline')

      // Then I should see the timeline for this placement
      placementShowPage.shouldShowApplicationTimeline(
        timeline.map(event => ({
          ...event,
          associatedUrls: null,
        })),
      )
      // And the timeline tab should be selected
      placementShowPage.shouldHaveActiveTab('Timeline')
    })

    it('should disable tabs if person is LAO', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement for a Limited Access person
      const { placement } = setup({}, 'lao')
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // And I click on the application tab
      placementShowPage.clickTab('Application')
      // Then I should remain on the Placement details tab
      placementShowPage.shouldHaveActiveTab('Placement details')
      // When I click on the assessment tab
      placementShowPage.clickTab('Assessment')
      // Then I should remain on the Placement details tab
      placementShowPage.shouldHaveActiveTab('Placement details')
      // When I select the timeline tab
      placementShowPage.clickTab('Timeline')
      // Then the timeline tab should be selected
      placementShowPage.shouldHaveActiveTab('Timeline')
    })

    it('should disable tabs if offline application', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement for an offline application
      const { placement } = setup({}, 'offline')
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see the offline application warning banner
      placementShowPage.shouldShowBanner(
        `This booking was imported from NDelius
        As such, Assessment and Request for Placement information isn't available.`,
      )
      // Then I wil be on the placement details tab
      placementShowPage.shouldHaveActiveTab('Placement details')
      // When I click on the assessment tab
      placementShowPage.clickTab('Assessment')
      // Then I should remain on the placement details tab
      placementShowPage.shouldHaveActiveTab('Placement details')
      // When I click on the Request for placement tab
      placementShowPage.clickTab('Request for placement')
      // Then I should remain on the Placement details tab
      placementShowPage.shouldHaveActiveTab('Placement details')
      // When I select the timeline tab
      placementShowPage.clickTab('Timeline')
      // When the timeline tab should be selected
      placementShowPage.shouldHaveActiveTab('Timeline')
      // When I select the Application tab
      placementShowPage.clickTab('Application')
      // When the Application tab should be selected
      placementShowPage.shouldHaveActiveTab('Application')
    })

    it('should select a tab from the path', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement
      const { placement, application } = setup()
      // When I visit the placement page with the timeline tab selected
      const placementShowPage = PlacementShowPage.visit(placement, 'application')
      // Then I should see the application for this placement
      placementShowPage.shouldShowPersonDetails(application.person as FullPerson)
      // And the application tab should be selected
      placementShowPage.shouldHaveActiveTab('Application')
    })

    it('should show a placement with missing fields', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement with missing data
      const { placement } = setup({
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
      })
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see greyed rows in the page tables
      placementShowPage.shouldNotShowUnpopulatedRows(placement, ['Actual arrival date', 'Actual departure date'])
      placementShowPage.shouldShowSummaryInformation(placement)
    })

    it('should show a list of linked placements', () => {
      // Given that I am signed in as a future manager
      signIn('future_manager')
      // And there is an existing placement
      const placementList = [
        { id: '1234', canonicalArrivalDate: '2024-06-10', canonicalDepartureDate: '2024-09-10' },
        { id: '1235', canonicalArrivalDate: '2026-01-02', canonicalDepartureDate: '2027-03-04' },
      ] as Array<Cas1SpaceBookingDates>
      const { placement } = setup({
        otherBookingsInPremisesForCrn: placementList,
      })

      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then the linked placement
      placementShowPage.shouldShowLinkedPlacements([
        'Placement 10 Jun 2024 to 10 Sep 2024',
        'Placement 2 Jan 2026 to 4 Mar 2027',
      ])
    })

    it('should require the correct permission to view a placement', () => {
      // Given that I am signed in as an applicant
      signIn('applicant')
      // And there is an existing placement
      const { placement } = setup()
      // When I visit the placement page
      // I should get an authorsation error
      PlacementShowPage.visitUnauthorised(placement)
    })
  })
})
