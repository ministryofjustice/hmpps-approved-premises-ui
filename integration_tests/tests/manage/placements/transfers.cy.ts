import { Cas1NewEmergencyTransfer, FullPerson } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import {
  cas1NewEmergencyTransferFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'
import { signIn } from '../../signIn'
import { NewTransferPage } from '../../../pages/manage/placements/transfers/new'
import Page from '../../../pages/page'
import { EmergencyDetailsPage } from '../../../pages/manage/placements/transfers/emergencyDetails'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { TransferConfirmPage } from '../../../pages/manage/placements/transfers/confirm'
import { transferSummaryList } from '../../../../server/utils/placements/transfers'
import apiPaths from '../../../../server/paths/api'

context('Transfers', () => {
  it('lets a future manager request an emergency transfer', () => {
    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory.current().build({
      premises,
    })
    const allApprovedPremises = cas1PremisesBasicSummaryFactory.buildList(5)
    const destinationAp = allApprovedPremises[2]
    const newEmergencyTransfer = cas1NewEmergencyTransferFactory.build({
      destinationPremisesId: destinationAp.id,
    })

    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubCas1AllPremises', allApprovedPremises)
    cy.task('stubSinglePremises', destinationAp)
    cy.task('stubSpaceBookingEmergencyTransferCreate', placement)

    // Given I am signed in as a future manager
    // TODO: change role to `future_manager` once the `cas1_transfer_create` permission has been assigned
    signIn('janitor')
    // signIn('future_manager')

    // When I view a current placement
    let placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Request a transfer' action
    placementPage.clickAction('Request a transfer')

    // Then I should see the form to request a transfer
    const newTransferPage = Page.verifyOnPage(NewTransferPage)
    newTransferPage.shouldShowPersonHeader(placement.person as FullPerson)
    newTransferPage.shouldShowForm()

    // When I complete the form and put a transfer date more than a week ago
    const overAWeekAgo = faker.date.recent({ refDate: addDays(new Date(), -8) })
    newTransferPage.completeForm(DateFormats.dateObjToIsoDate(overAWeekAgo))

    // Then I should see an error
    newTransferPage.shouldShowErrorMessagesForFields(['transferDate'], {
      transferDate: 'The date of transfer must be today or in the last 7 days',
    })

    // When I complete the form and put a transfer date of tomorrow
    const tomorrow = addDays(new Date(), 1)
    newTransferPage.completeForm(DateFormats.dateObjToIsoDate(tomorrow))

    // Then I should see an error
    newTransferPage.shouldShowErrorMessagesForFields(['transferDate'], {
      transferDate: 'The date of transfer must be today or in the last 7 days',
    })

    // When I complete the form and put an acceptable transfer date
    newTransferPage.completeForm(newEmergencyTransfer.arrivalDate)

    // Then I should see the form to add details for the emergency transfer
    const emergencyTransferDetailsPage = Page.verifyOnPage(EmergencyDetailsPage, placement)
    emergencyTransferDetailsPage.shouldShowPersonHeader(placement.person as FullPerson)
    emergencyTransferDetailsPage.shouldShowForm()

    // When I submit the form without completing the fields
    emergencyTransferDetailsPage.clickContinue()

    // Then I should see errors
    emergencyTransferDetailsPage.shouldShowErrorMessagesForFields(['destinationPremisesId', 'placementEndDate'], {
      destinationPremisesId: 'You must select aa Approved Premises for the person to be transferred to',
      placementEndDate: 'You must enter a placement end date',
    })

    // When I complete the form
    emergencyTransferDetailsPage.completeForm(destinationAp.name, newEmergencyTransfer.departureDate)

    // Then I should see the confirmation page
    const emergencyTransferConfirmationPage = Page.verifyOnPage(TransferConfirmPage)
    emergencyTransferConfirmationPage.shouldContainSummaryListItems(
      transferSummaryList({
        transferDate: newEmergencyTransfer.arrivalDate,
        placementEndDate: newEmergencyTransfer.departureDate,
        destinationPremisesName: destinationAp.name,
      }).rows,
    )

    // When I submit the transfer request
    emergencyTransferConfirmationPage.clickSubmit()

    // Then I should be redirected to the placement page with a success banner
    placementPage = Page.verifyOnPage(PlacementShowPage, placement)
    placementPage.shouldShowBanner(`
      Emergency transfer recorded
      You must now record the person as departed, and use the move-on category for transfer.
    `)

    // And the API was called to create the transfer request
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.emergencyTransfer({ premisesId: premises.id, placementId: placement.id }),
    ).then(body => {
      const { arrivalDate, departureDate, destinationPremisesId } = body as Cas1NewEmergencyTransfer
      expect(arrivalDate).equal(newEmergencyTransfer.arrivalDate)
      expect(departureDate).equal(newEmergencyTransfer.departureDate)
      expect(destinationPremisesId).equal(newEmergencyTransfer.destinationPremisesId)
    })
  })
})
