import { ApprovedPremisesUserPermission, Cas1SpaceBookingDates, FullPerson } from '@approved-premises/api'
import {
  applicationFactory,
  assessmentFactory,
  cas1SpaceBookingFactory,
  personFactory,
  placementRequestFactory,
  premisesSummaryFactory,
  timelineEventFactory,
} from '../../../../server/testutils/factories'

import { PlacementShowPage } from '../../../pages/manage'

import { signIn } from '../../signIn'

context('Placements', () => {
  describe('show', () => {
    const setup = (permissions: Array<ApprovedPremisesUserPermission>, placementParameters = {}) => {
      cy.task('reset')
      signIn([], permissions)
      const premises = premisesSummaryFactory.build()
      const person = personFactory.build()
      const application = applicationFactory.build({ person, personStatusOnSubmission: person.status })
      const assessment = assessmentFactory.build()
      const placementRequest = placementRequestFactory.build()
      const placement = cas1SpaceBookingFactory.build({
        ...placementParameters,
        applicationId: application.id,
        assessmentId: assessment.id,
        requestForPlacementId: placementRequest.id,
        premises,
        person,
      })
      const timeline = timelineEventFactory.buildList(10)

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
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement } = setup(['cas1_space_booking_view'])
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see the person information in the header
      placementShowPage.shouldShowPersonHeader(placement.person as FullPerson)
      // And the placement details in the page tables
      placementShowPage.shouldShowSummaryInformation(placement)
      // And the placement details tab should be selected
      placementShowPage.shouldHaveTabSelected('Placement details')
    })

    it('should show a placement (Application tab)', () => {
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement, application } = setup(['cas1_space_booking_view'])
      // When I visit the placement page with the application tab showing
      const placementShowPage = PlacementShowPage.visit(placement, 'application')
      // Then I should see the details of the person
      placementShowPage.shouldShowPersonDetails(application.person as FullPerson)
      // And the application tab should be selected
      placementShowPage.shouldHaveTabSelected('Application')
    })

    it('should show a placement (Assessment tab)', () => {
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement, assessment } = setup(['cas1_space_booking_view'])
      // When I visit the placement page with the assessment tab selected
      const placementShowPage = PlacementShowPage.visit(placement, 'assessment')
      // Then I should see the details of the assessment
      placementShowPage.shouldShowCheckYourAnswersResponses(assessment)
      // And the assessment tab should be selected
      placementShowPage.shouldHaveTabSelected('Assessment')
    })

    it('should show a placement (Timeline tab)', () => {
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement, timeline } = setup(['cas1_space_booking_view'])
      // When I visit the placement page with the timeline selected
      const placementShowPage = PlacementShowPage.visit(placement, 'timeline')
      // Then I should see the timeline for this placement
      placementShowPage.shouldShowApplicationTimeline(timeline)
      // And the timeline tab should be selected
      placementShowPage.shouldHaveTabSelected('Timeline')
    })

    it('should show a placement (Placement request tab)', () => {
      // Given that I am logged in with permission to view a placement and a mocked placement
      const { placement, placementRequest } = setup(['cas1_space_booking_view'])
      // When I visit the placement page with the request for placement tab selected
      const placementShowPage = PlacementShowPage.visit(placement, 'placementrequest')
      // Then I should see the details of the request for placement
      placementShowPage.shouldShowPlacementRequestDetails(placementRequest)
      // And the 'request for placement' tab should be selected
      placementShowPage.shouldHaveTabSelected('Request for placement')
    })

    it('should show a placement with missing fields', () => {
      // Given I am logged in with permission to view a placement
      // And the mocked placement has missing data
      const { placement } = setup(['cas1_space_booking_view'], {
        actualArrivalDateOnly: undefined,
        actualDepartureDateOnly: undefined,
      })
      // When I visit the placement page
      const placementShowPage = PlacementShowPage.visit(placement)
      // Then I should see greyed rows in the page tables
      placementShowPage.shouldNotShowUnpopulatedRows(placement, ['Actual arrival date', 'Actual departure date'])
      placementShowPage.shouldShowSummaryInformation(placement)
    })

    it('should show a list of linked placements', () => {
      const placementList = [
        { id: '1234', canonicalArrivalDate: '2024-06-10', canonicalDepartureDate: '2024-09-10' },
        { id: '1235', canonicalArrivalDate: '2026-01-02', canonicalDepartureDate: '2027-03-04' },
      ] as Array<Cas1SpaceBookingDates>
      const { placement } = setup(['cas1_space_booking_view'], {
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
      // Given I am logged in with permission to view a placement and a mocked placement
      const { placement } = setup([])
      // When I visit the placement page
      // I should get an authorsation error
      PlacementShowPage.visitUnauthorised(placement)
    })
  })
})
