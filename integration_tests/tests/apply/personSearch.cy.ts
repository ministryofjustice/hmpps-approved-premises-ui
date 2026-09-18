import { personFactory } from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import { setup } from './setup'
import { AND, THEN, WHEN } from '../../helpers'
import Page from '../../pages'
import * as ApplyPages from '../../pages/apply'

context('Apply - Person Search', () => {
  beforeEach(setup)

  it("creates and updates an application given a person's CRN", function test() {
    const apply = new ApplyHelper(this.application, this.person, this.offences)
    apply.setupApplicationStubs()
    apply.startApplication()

    THEN('the API should have created the application')
    cy.task('verifyApplicationCreate').then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)
      const offence = this.offences[0]

      expect(body.crn).equal(this.person.crn)
      expect(body.convictionId).equal(offence.convictionId)
      expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
      expect(body.offenceId).equal(offence.offenceId)
    })

    AND('I complete the basic information step')
    apply.completeBasicInformation()

    THEN('the API should have recieved the updated application')
    cy.task('verifyApplicationUpdate', this.application.id).then(requests => {
      const firstRequestData = JSON.parse(requests[0].body).data
      const secondRequestData = JSON.parse(requests[1].body).data

      expect(firstRequestData['basic-information']['confirm-your-details'].emailAddress).equal('bob@test.gov.uk')
      expect(secondRequestData['basic-information']['case-manager-information'].name).equal('Bob Smith')
    })
  })

  it('shows an error message if the person is not found', function test() {
    AND('the person I am about to search for is not in Delius')
    const person = personFactory.build()
    cy.task('stubPersonNotFound', { person })

    AND('I have started an application')
    const startPage = ApplyPages.StartPage.visit()
    startPage.startApplication()
    const startWarningPage = Page.verifyOnPage(ApplyPages.StartWarningPage)
    startWarningPage.clickContinue()

    WHEN('I enter a CRN')
    const crnPage = new ApplyPages.EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    THEN('I should see an error message')
    crnPage.shouldShowPersonNotFoundErrorMessage(person)
  })
})
