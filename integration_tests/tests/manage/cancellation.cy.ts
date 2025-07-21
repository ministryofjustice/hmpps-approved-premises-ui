import {
  applicationFactory,
  cas1SpaceBookingFactory,
  newCancellationFactory,
  premisesFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'

import { CancellationCreatePage } from '../../pages/manage'
import { signIn } from '../signIn'
import BookingCancellationConfirmPage from '../../pages/manage/bookingCancellationConfirmation'
import apiPaths from '../../../server/paths/api'

context('Cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCancellationReferenceData')

    cy.log('Given I am signed in as a CRU member')
    signIn('cru_member')
  })

  it('should show errors', () => {
    cy.log('Given a placement is available')
    const premises = premisesFactory.build()
    const placement = cas1SpaceBookingFactory.build()
    const placementId = placement.id
    const premisesId = premises.id
    cy.task('stubSpaceBookingGetWithoutPremises', placement)

    cy.log("When I navigate to the placement's cancellation page")
    const cancellation = newCancellationFactory.build()
    cy.task('stubCancellationCreate', { premisesId, placementId, cancellation })

    const page = CancellationCreatePage.visit(premisesId, placementId)

    cy.log('And I miss a required field')
    cy.task('stubCancellationErrors', {
      premisesId: premises.id,
      placementId: placement.id,
      params: ['reason'],
    })

    page.clickSubmit()

    cy.log('Then I should see error messages relating to that field')
    page.shouldShowErrorMessagesForFields(['reason'])

    cy.log('And the back link should be populated correctly')
    page.shouldShowBackLinkToApplicationWithdraw(placement.applicationId)
  })

  it('should allow me to create a cancellation for a space booking ', () => {
    cy.log('Given a booking is available')
    const application = applicationFactory.build()
    const placement = cas1SpaceBookingFactory.upcoming().build({ applicationId: application.id })
    const premises = premisesFactory.build({ id: placement.premises.id })

    const placementId = placement.id
    const premisesId = premises.id

    cy.task('stubSpaceBookingShow', placement)

    const cancellation = newCancellationFactory.withOtherReason().build()
    const withdrawable = withdrawableFactory.build({ id: placementId, type: 'space_booking' })
    cy.task('stubWithdrawablesWithNotes', { applicationId: application.id, withdrawables: [withdrawable] })
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubCancellationCreate', { premisesId, placementId, cancellation })

    cy.log("When I navigate to the booking's cancellation page")
    const cancellationPage = CancellationCreatePage.visit(premisesId, placementId)

    cancellationPage.shouldShowBackLinkToApplicationWithdraw(application.id)

    cy.log('And I complete the reason and notes')
    cancellationPage.completeForm(cancellation)

    cy.log('Then a cancellation should have been created in the API')
    cy.task('verifyApiPost', apiPaths.premises.placements.cancel({ premisesId, placementId })).then(
      ({ reasonNotes, reasonId }) => {
        expect(reasonNotes).equal(cancellation.otherReason)
        expect(reasonId).equal(cancellation.reason)
      },
    )

    cy.log('And I should see a confirmation message')
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()
  })

  it('should allow me to create a cancellation for a space-booking without an applicationId', () => {
    cy.log('Given a placement is available')
    const premises = premisesFactory.build()
    const placement = cas1SpaceBookingFactory.build({ applicationId: undefined })
    const placementId = placement.id
    const premisesId = premises.id
    cy.task('stubSpaceBookingGetWithoutPremises', placement)

    cy.log("When I navigate to the placement's cancellation page")
    const cancellation = newCancellationFactory.build()
    cy.task('stubCancellationCreate', { premisesId, placementId, cancellation })

    const page = CancellationCreatePage.visit(premisesId, placementId)

    cy.log('Then the backlink should be populated correctly')
    page.shouldShowBacklinkToPlacement()

    cy.log('When I fill out the cancellation form')
    page.completeForm(cancellation)

    cy.log('Then a cancellation should have been created in the API')
    cy.task('verifyApiPost', apiPaths.premises.placements.cancel({ premisesId, placementId })).then(({ reasonId }) => {
      expect(reasonId).equal(cancellation.reason)
    })

    cy.log('And I should see a confirmation message')
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()
  })
})
