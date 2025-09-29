import PlacementRequestPage from '../../pages/match/placementRequestPage'
import {
  applicationFactory,
  cas1PlacementRequestDetailFactory,
  cas1SpaceBookingFactory,
  newCancellationFactory,
  premisesFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'

import { CancellationCreatePage } from '../../pages/manage'
import { signIn } from '../signIn'
import apiPaths from '../../../server/paths/api'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { placementKeyDetails } from '../../../server/utils/placements'

context('Cancellation', () => {
  const createStubs = (noApplication = false) => {
    const application = !noApplication && applicationFactory.build()
    const premises = premisesFactory.build()
    const placementRequest = cas1PlacementRequestDetailFactory.build()
    const placement = cas1SpaceBookingFactory.build({
      applicationId: application ? application.id : undefined,
      placementRequestId: placementRequest.id,
    })
    const cancellation = newCancellationFactory.build()

    cy.task('stubCancellationReferenceData')
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubCancellationCreate', { premisesId: premises.id, placementId: placement.id, cancellation })

    return {
      application,
      premises,
      placementRequest,
      placement,
      premisesId: premises.id,
      placementId: placement.id,
      cancellation,
    }
  }

  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')
  })

  it('should show errors', () => {
    GIVEN('a placement is available')
    const { premisesId, placementId, placement } = createStubs()

    WHEN("I navigate to the placement's cancellation page")

    const page = CancellationCreatePage.visit(premisesId, placementId)

    AND('I miss a required field')
    cy.task('stubCancellationErrors', {
      premisesId,
      placementId,
      params: ['reason'],
    })

    page.clickSubmit()

    THEN('I should see error messages relating to that field')
    page.shouldShowErrorMessagesForFields(['reason'])

    AND('the back link should be populated correctly')
    page.shouldShowBackLinkToApplicationWithdraw(placement.applicationId)
  })

  it('should allow me to create a cancellation for a space booking ', () => {
    GIVEN('a booking is available')
    const { premisesId, placementId, placement, application } = createStubs()

    const cancellation = newCancellationFactory.withOtherReason().build()
    const withdrawable = withdrawableFactory.build({ id: placementId, type: 'space_booking' })
    cy.task('stubWithdrawablesWithNotes', { applicationId: application.id, withdrawables: [withdrawable] })

    WHEN("I navigate to the booking's cancellation page")
    const cancellationPage = CancellationCreatePage.visit(premisesId, placementId)

    cancellationPage.shouldShowKeyDetails(placementKeyDetails(placement))
    cancellationPage.shouldShowBackLinkToApplicationWithdraw(application.id)

    AND('I complete the reason and notes')
    cancellationPage.completeForm(cancellation)

    THEN('a cancellation should have been created in the API')
    cy.task('verifyApiPost', apiPaths.premises.placements.cancel({ premisesId, placementId })).then(
      ({ reasonNotes, reasonId }) => {
        expect(reasonNotes).equal(cancellation.otherReason)
        expect(reasonId).equal(cancellation.reason)
      },
    )

    AND('I should see a confirmation message')
    const placementRequestPage = new PlacementRequestPage()
    placementRequestPage.shouldShowWithdrawalBanner(placement)
  })

  it('should allow me to create a cancellation for a space-booking without an applicationId', () => {
    GIVEN('a placement is available')

    const { placementId, premisesId, cancellation, placement } = createStubs(true)

    cy.task('stubCancellationCreate', { premisesId, placementId, cancellation })

    WHEN("I navigate to the placement's cancellation page")

    const page = CancellationCreatePage.visit(premisesId, placementId)

    THEN('the backlink should be populated correctly')
    page.shouldShowBacklinkToPlacement()

    WHEN('I fill out the cancellation form')
    page.completeForm(cancellation)

    THEN('a cancellation should have been created in the API')
    cy.task('verifyApiPost', apiPaths.premises.placements.cancel({ premisesId, placementId })).then(({ reasonId }) => {
      expect(reasonId).equal(cancellation.reason)
    })

    AND('I should see a confirmation message')
    const placementRequestPage = new PlacementRequestPage()
    placementRequestPage.shouldShowWithdrawalBanner(placement)
  })
})
