import { type Cas1NewChangeRequest, NamedId } from '@approved-premises/api'
import Page from '../../../pages/page'
import { signIn } from '../../signIn'
import { cas1PremisesFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
import { PlacementShowPage } from '../../../pages/manage'
import { NewPlacementAppealPage } from '../../../pages/manage/placements/appeals/new'
import { ConfirmPage } from '../../../pages/manage/placements/appeals/confirm'
import { appealReasonRadioDefinitions } from '../../../../server/utils/placements/changeRequests'
import apiPath from '../../../../server/paths/api'

context('Appeals', () => {
  it('A future manager creates an appeal against a placement', () => {
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
    const newPage = Page.verifyOnPage(NewPlacementAppealPage)

    newPage.shouldShowFormControls(newPage.fieldDetails)
    // When I submit the empty form
    newPage.clickSubmit()

    // Then I should see errors
    newPage.shouldShowErrorMessages(newPage.fieldDetails)

    // When I complete and submit the form
    newPage.completeForm(newPage.fieldDetails)
    newPage.clickSubmit()

    // Then I should see an error for the selected reason details
    newPage.shouldShowFormControls(newPage.reasonDetailsFieldDetails)
    newPage.shouldShowErrorMessages(newPage.reasonDetailsFieldDetails)

    // When I add details and submit
    newPage.completeForm(newPage.reasonDetailsFieldDetails)
    newPage.clickSubmit()

    // Then I should be on the confirm screen
    const confirmPage = Page.verifyOnPage(ConfirmPage)
    confirmPage.checkSummary({ ...newPage.fieldDetails, ...newPage.reasonDetailsFieldDetails })

    // When I click back
    confirmPage.clickBack()

    // Then I should be on the new page again
    newPage.checkOnPage()

    // And I should be able to submit again (proving that the form is pre-populated)
    newPage.clickSubmit()
    confirmPage.checkSummary({ ...newPage.fieldDetails, ...newPage.reasonDetailsFieldDetails })

    // When I create the appeal
    newPage.clickButton('Create appeal')

    // Then the appeal change request should be created
    cy.task('verifyApiPost', apiPath.placementRequests.appeal({ id: placement.placementRequestId })).then(
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
})
