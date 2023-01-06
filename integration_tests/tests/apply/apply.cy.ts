import {
  EnterCRNPage,
  ListPage,
  SelectOffencePage,
  SentenceTypePage,
  StartPage,
} from '../../../cypress_shared/pages/apply'

import { mapApiPersonRisksForUi } from '../../../server/utils/utils'

import activeOffenceFactory from '../../../server/testutils/factories/activeOffence'
import applicationFactory from '../../../server/testutils/factories/application'
import ApplyHelper from '../../../cypress_shared/helpers/apply'
import Page from '../../../cypress_shared/pages/page'
import personFactory from '../../../server/testutils/factories/person'
import risksFactory from '../../../server/testutils/factories/risks'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows the user to select an index offence if there is more than one offence', () => {
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })

    // And that person has more than one offence listed under their CRN
    const offences = activeOffenceFactory.buildList(4)
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person, data: applicationData })
      cy.task('stubApplicationCreate', { application })

      const apply = new ApplyHelper(application, person, 'integration')
      apply.startApplication()

      // Then I should be forwarded to select an offence
      const selectOffencePage = Page.verifyOnPage(SelectOffencePage, person, offences)
      selectOffencePage.shouldDisplayOffences()

      // When I select an offence
      const selectedOffence = offences[0]
      selectOffencePage.selectOffence(selectedOffence)

      // And I click submit
      selectOffencePage.clickSubmit()

      // Then the API should have created the application with my selected offence
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)

        expect(body.crn).equal(person.crn)
        expect(body.convictionId).equal(selectedOffence.convictionId)
        expect(body.deliusEventNumber).equal(selectedOffence.deliusEventNumber)
        expect(body.offenceId).equal(selectedOffence.offenceId)
      })

      // Then I should be on the Sentence Type page
      Page.verifyOnPage(SentenceTypePage, application)
    })
  })

  it("creates and updates an application given a person's CRN", () => {
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    const offences = activeOffenceFactory.buildList(1)
    cy.task('stubFindPerson', { person })
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person, data: applicationData })
      cy.task('stubApplicationCreate', { application })
      cy.task('stubApplicationUpdate', { application })
      cy.task('stubApplicationGet', { application })

      const apply = new ApplyHelper(application, person, 'integration')
      apply.startApplication()

      // Then the API should have created the application
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)
        const offence = offences[0]

        expect(body.crn).equal(person.crn)
        expect(body.convictionId).equal(offence.convictionId)
        expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
        expect(body.offenceId).equal(offence.offenceId)
      })

      // And I complete the basic information step
      apply.completeBasicInformation()

      // Then the API should have recieved the updated application
      cy.task('verifyApplicationUpdate', application.id).then(requests => {
        const firstRequestData = JSON.parse(requests[0].body).data
        const secondRequestData = JSON.parse(requests[1].body).data

        expect(firstRequestData['basic-information']['sentence-type'].sentenceType).equal('bailPlacement')
        expect(secondRequestData['basic-information'].situation.situation).equal('bailSentence')
      })
    })
  })

  it('shows an error message if the person is not found', () => {
    // Given I am logged in
    cy.signIn()

    // And the person I am about to search for is not in Delius
    const person = personFactory.build()
    cy.task('stubPersonNotFound', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    crnPage.shouldShowErrorMessage(person)
  })

  it('allows completion of the form', () => {
    const person = personFactory.build()
    const apiRisks = risksFactory.build({ crn: person.crn })
    const uiRisks = mapApiPersonRisksForUi(apiRisks)
    const offences = activeOffenceFactory.buildList(1)

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    cy.task('stubPersonRisks', { person, risks: apiRisks })
    cy.task('stubFindPerson', { person })
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person })
      application.data = applicationData
      application.risks = apiRisks

      // And I complete the application
      const apply = new ApplyHelper(application, person, 'integration')
      apply.setupApplicationStubs(uiRisks)
      apply.startApplication()
      apply.completeApplication()

      // Then the application should be submitted to the API
      cy.task('verifyApplicationUpdate', application.id).then((requests: Array<{ body: string }>) => {
        expect(requests).to.have.length(apply.numberOfPages())
        const requestBody = JSON.parse(requests[requests.length - 1].body)

        expect(requestBody.data).to.deep.equal(applicationData)

        cy.task('validateBodyAgainstApplySchema', requestBody.data).then(result => {
          expect(result).to.equal(true)
        })
      })

      cy.task('verifyApplicationSubmit', application.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(`/applications/${application.id}/submission`)
      })

      // And I should be taken to the confirmation page
      const confirmationPage = new SubmissionConfirmation()

      // Given there are applications in the database
      const applications = applicationFactory.withReleaseDate().buildList(5)
      cy.task('stubApplications', applications)

      // And there are risks in the database
      const risks = risksFactory.buildList(5)
      applications.forEach((stubbedApplication, i) => {
        cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
      })

      // When I click 'Back to dashboard'
      confirmationPage.clickBackToDashboard()

      // Then I am taken back to the dashboard
      Page.verifyOnPage(ListPage)
    })
  })
})
