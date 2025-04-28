import { FullPerson } from '@approved-premises/api'
import { cas1PremisesFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'
import { signIn } from '../../signIn'
import { TransferRequestPage } from '../../../pages/manage/placements/transfers/new'
import { roleToPermissions } from '../../../../server/utils/users/roles'

context('Transfers', () => {
  it('lets a future manager request an emergency transfer', () => {
    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory.current().build({
      premises,
    })

    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)

    // Given I am signed in as a future manager
    // TODO: change role to `future_manager` once the `cas1_planned_transfer_create` permission has been assigned
    signIn('janitor')
    // signIn('future_manager')

    // When I view a current placement
    const placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Request a transfer' action
    placementPage.clickAction('Request a transfer')

    // Then I should see the form to request a transfer
    const transferRequestPage = new TransferRequestPage()
    transferRequestPage.shouldShowPersonHeader(placement.person as FullPerson)
    transferRequestPage.shouldShowForm()
  })
})
