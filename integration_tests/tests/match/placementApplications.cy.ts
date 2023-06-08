import { applicationFactory, placementApplicationFactory } from '../../../server/testutils/factories'
import { ShowPage } from '../../pages/apply'
import DateOfPlacement from '../../pages/match/placementRequestForm/datesOfPlacement'
import PreviousRotlPlacement from '../../pages/match/placementRequestForm/previousRotlPlacement'
import ReasonForPlacementPage from '../../pages/match/placementRequestForm/reasonForPlacement'
import SameAp from '../../pages/match/placementRequestForm/sameAp'
import UpdatesToApplication from '../../pages/match/placementRequestForm/updatesToApplication'
import CheckYourAnswers from '../../pages/match/placementRequestForm/checkYourAnswers'
import ConfirmationPage from '../../pages/match/placementRequestForm/confirmationPage'
import AdditionalPlacementDetailsPage from '../../pages/match/placementRequestForm/additionalPlacementDetails'
import Page from '../../pages/page'
import paths from '../../../server/paths/api'
import DecisionToRelease from '../../pages/match/placementRequestForm/decisionToRelease'

context('Placement Applications', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  beforeEach(() => {
    cy.signIn()
  })
  it('allows me to complete form if the reason for placement is ROTL', () => {
    cy.fixture('rotlPlacementApplicationData.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const completedApplication = applicationFactory.build({ status: 'submitted', id: '123' })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)

      // When I visit the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // Then I should be able to click submit
      showPage.clickSubmit()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('rotl')
      placementReasonPage.clickSubmit()

      const previousRotlPlacementPage = new PreviousRotlPlacement()
      previousRotlPlacementPage.completeForm()
      previousRotlPlacementPage.clickSubmit()

      const sameApPage = new SameAp()
      sameApPage.completeForm()
      sameApPage.clickSubmit()

      const datesOfPlacementPage = new DateOfPlacement()
      datesOfPlacementPage.completeForm()
      datesOfPlacementPage.clickSubmit()

      const updatesToApplication = new UpdatesToApplication()
      updatesToApplication.completeForm()
      updatesToApplication.clickSubmit()

      const checkYourAnswersPage = new CheckYourAnswers()
      checkYourAnswersPage.completeForm()
      checkYourAnswersPage.clickSubmit()

      // Then I should be taken to the confirmation page
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('placementDates', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is an additional placement on an existing application', () => {
    cy.fixture('existingApplicationPlacementApplication.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const completedApplication = applicationFactory.build({ status: 'submitted', id: '123' })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)

      // When I visit the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // Then I should be able to click submit
      showPage.clickSubmit()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('additional_placement')
      placementReasonPage.clickSubmit()

      const additionalPlacementDetailsPage = new AdditionalPlacementDetailsPage()
      additionalPlacementDetailsPage.completeForm()
      additionalPlacementDetailsPage.clickSubmit()

      const updatesToApplication = new UpdatesToApplication()
      updatesToApplication.completeForm()
      updatesToApplication.clickSubmit()

      const checkYourAnswersPage = new CheckYourAnswers()
      checkYourAnswersPage.completeForm()
      checkYourAnswersPage.clickSubmit()

      // Then I should be taken to the confirmation page
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('placementDates', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is parole board', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const completedApplication = applicationFactory.build({ status: 'submitted', id: '123' })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)

      // When I visit the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // Then I should be able to click submit
      showPage.clickSubmit()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('paroleBoard')
      placementReasonPage.clickSubmit()

      const decisionToReleasePage = new DecisionToRelease()
      decisionToReleasePage.completeForm()
      decisionToReleasePage.clickSubmit()
    })
  })
})
