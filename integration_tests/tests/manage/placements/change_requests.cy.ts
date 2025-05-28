import { Cas1NewChangeRequest, Cas1NewEmergencyTransfer, FullPerson, NamedId } from '@approved-premises/api'
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
import {
  emergencyTransferSummaryList,
  plannedTransferSuccessMessage,
  plannedTransferSummaryList,
} from '../../../../server/utils/placements/transfers'
import apiPaths from '../../../../server/paths/api'
import { PlannedDetailsPage } from '../../../pages/manage/placements/transfers/plannedDetails'
import { PlannedTransferConfirm } from '../../../pages/manage/placements/transfers/plannedConfirm'
import { appealReasonRadioDefinitions } from '../../../../server/utils/placements/changeRequests'
import { NewPlacementAppealPage } from '../../../pages/manage/placements/appeals/new'
import { ConfirmPage } from '../../../pages/manage/placements/appeals/confirm'

context('Change requests', () => {
  it('lets a future manager create an appeal against a placement', () => {
    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory.upcoming().build({
      premises,
    })

    const changeRequestReasons: Array<NamedId> = Object.keys(appealReasonRadioDefinitions).map(name => ({
      name,
      id: name,
    }))
    cy.task('stubSinglePremises', premises)
    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubChangeRequestReasonsReferenceData', {
      changeRequestType: 'placementAppeal',
      reasons: changeRequestReasons,
    })
    cy.task('stubPlacementAppealCreate', placement.placementRequestId)

    // Given I am signed in as a future manager with change request developer rights.
    // TODO: remove 'change_request_dev' role once cas1_placement_appeal_create assigned to 'future_manager'
    signIn(['future_manager', 'change_request_dev'])

    // When I view a new placement
    const placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Appeal' action
    placementPage.clickAction('Request an appeal')

    // Then I should see the form to create an appeal
    const newPage = new NewPlacementAppealPage(placement)

    newPage.shouldShowFormControls()
    // When I submit the empty form
    newPage.clickSubmit()

    // Then I should see errors
    newPage.shouldShowErrorMessages()

    // When I complete and submit the form
    newPage.populateForm()
    newPage.clickSubmit()

    // Then I should see an error for the selected reason details
    newPage.shouldShowFormControls(newPage.reasonDetailsFieldDetails)
    newPage.shouldShowErrorMessages(newPage.reasonDetailsFieldDetails)

    // When I add details and submit
    newPage.populateForm(newPage.reasonDetailsFieldDetails)
    newPage.clickSubmit()

    // Then I should be on the confirm screen
    const confirmPage = new ConfirmPage()
    confirmPage.checkSummary({ ...newPage.fieldDetails, ...newPage.reasonDetailsFieldDetails })

    // When I click back
    confirmPage.clickBack()

    // Then I should be on the new page again
    newPage.checkOnPage()

    // And the form should be pre-populated
    newPage.shouldBePopulated({ ...newPage.fieldDetails, ...newPage.reasonDetailsFieldDetails })

    // When I submit again
    newPage.clickSubmit()
    confirmPage.checkSummary({ ...newPage.fieldDetails, ...newPage.reasonDetailsFieldDetails })

    // When I create the appeal
    newPage.clickButton('Create appeal')

    // Then the appeal change request should be created
    cy.task('verifyApiPost', apiPaths.placementRequests.appeal({ id: placement.placementRequestId })).then(
      (body: Cas1NewChangeRequest) => {
        const { spaceBookingId, reasonId, type, requestJson } = body
        expect(spaceBookingId).equal(placement.id)
        expect(reasonId).equal('offenceNotAccepted')
        expect(type).equal('placementAppeal')
        expect(requestJson).equal(newPage.getRequestJson())
      },
    )

    // Then I should be redirected back to the placement details page with a banner
    placementPage.checkOnPage()
    placementPage.shouldShowBanner(`
      You have appealed this placement
      This placement will remain visible under the 'Upcoming' tab until your appeal is progressed by the CRU.
    `)
  })

  it('lets a future manager request an emergency transfer', () => {
    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory.current().build({
      premises,
    })
    const allApprovedPremises = cas1PremisesBasicSummaryFactory.buildList(5, { supportsSpaceBookings: true })
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
    // TODO: remove 'change_request_dev' role once transfer create permissions assigned to 'future_manager'
    signIn(['future_manager', 'change_request_dev'])

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
      transferDate: 'The date of transfer cannot be earlier than one week ago',
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
      destinationPremisesId: 'You must select an Approved Premises for the person to be transferred to',
      placementEndDate: 'You must enter a placement end date',
    })

    // When I complete the form
    emergencyTransferDetailsPage.completeForm(destinationAp.name, newEmergencyTransfer.departureDate)

    // Then I should see the confirmation page
    const emergencyTransferConfirmationPage = Page.verifyOnPage(TransferConfirmPage)
    emergencyTransferConfirmationPage.shouldContainSummaryListItems(
      emergencyTransferSummaryList({
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

  it('lets a future manager create a planned transfer request', () => {
    const premises = cas1PremisesFactory.build()
    const placement = cas1SpaceBookingFactory.current().build({
      premises,
    })
    const allApprovedPremises = cas1PremisesBasicSummaryFactory.buildList(5, { supportsSpaceBookings: true })
    const destinationAp = allApprovedPremises[2]

    cy.task('stubSpaceBookingShow', placement)
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubSinglePremises', destinationAp)
    cy.task('stubPlannedTransferCreate', placement.placementRequestId)

    const pannedTransferReasons: Array<string> = [
      'extendingThePlacementNoCapacityAtCurrentAp',
      'placementPrioritisation',
      'movingPersonCloserToResettlementArea',
    ]

    cy.task('stubChangeRequestReasonsReferenceData', {
      changeRequestType: 'plannedTransfer',
      reasons: pannedTransferReasons.map(name => ({ name, id: `${name}Id` })),
    })

    // Given I am signed in as a future manager
    // TODO: remove 'change_request_dev' role once transfer create permissions assigned to 'future_manager'
    signIn(['future_manager', 'change_request_dev'])

    // When I view a current placement
    const placementPage = PlacementShowPage.visit(placement)

    // And I click on the 'Request a transfer' action
    placementPage.clickAction('Request a transfer')

    // Then I should see the form to request a transfer
    const newTransferPage = Page.verifyOnPage(NewTransferPage)
    newTransferPage.shouldShowPersonHeader(placement.person as FullPerson)
    newTransferPage.shouldShowForm()

    // When I complete the form and put a transfer date of tomorrow
    const tomorrow = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))
    newTransferPage.completeForm(tomorrow)

    const plannedDetailsPage = Page.verifyOnPage(PlannedDetailsPage, placement)
    plannedDetailsPage.shouldShowFormControls()
    plannedDetailsPage.clickSubmit()

    // Then I should see errors
    plannedDetailsPage.shouldShowErrorMessages()

    // When I complete the form and submit
    plannedDetailsPage.populateForm()
    plannedDetailsPage.clickSubmit()

    // Then I should see the confirm page
    const confirmationPage = Page.verifyOnPage(PlannedTransferConfirm)

    const fieldValues: Record<string, string> = {
      transferDate: tomorrow,
      ...plannedDetailsPage.getFieldValueMap(),
    }
    confirmationPage.shouldContainSummaryListItems(plannedTransferSummaryList(fieldValues).rows)

    // When I submit the form
    confirmationPage.clickSubmit()

    // Then I should be redirected back to the placement page with a success banner
    placementPage.checkOnPage()
    placementPage.shouldShowBanner(`Transfer requested${plannedTransferSuccessMessage.body}`)

    // And the API was called to create the planned transfer change request
    cy.task('verifyApiPost', apiPaths.placementRequests.plannedTransfer({ id: placement.placementRequestId })).then(
      body => {
        const { spaceBookingId, type, reasonId, requestJson } = body as Cas1NewChangeRequest

        expect(spaceBookingId).equal(placement.id)
        expect(type).equal('plannedTransfer')
        expect(reasonId).equal('placementPrioritisationId')
        const { isFlexible, transferReason, notes } = plannedDetailsPage.getFieldValueMap() as {
          isFlexible: string
          transferReason: string
          notes: string
        }
        const {
          isFlexible: actualIsFlexible,
          transferReason: actualTransferReason,
          notes: actualNotes,
        } = JSON.parse(requestJson as unknown as string)
        expect(actualIsFlexible).equal(isFlexible)
        expect(actualTransferReason).equal(transferReason)
        expect(actualNotes).equal(notes)
      },
    )
  })
})
