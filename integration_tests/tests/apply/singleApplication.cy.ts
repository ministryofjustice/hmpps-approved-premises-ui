import { FullPerson } from '@approved-premises/api'
import { setup } from './setup'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import ApplyHelper from '../../helpers/apply'
import { cas1ApplicationSummaryFactory } from '../../../server/testutils/factories'
import * as ApplyPages from '../../pages/apply'
import Page from '../../pages/page'
import apiPaths from '../../../server/paths/api'
import { statusesLimitedToOne } from '../../../server/utils/applications/statusTag'

context('Single application per CRN', () => {
  beforeEach(setup)

  it('blocks the user from creating an application if there are already applications for the crn', function test() {
    GIVEN('There is an application for the crn')
    const applications = cas1ApplicationSummaryFactory.buildList(2)
    cy.task('stubAllApplications', { applications, anyQuery: true })

    WHEN('I try to create an application')
    const helper = new ApplyHelper(this.application, this.person, this.offences)
    helper.setupApplicationStubs(mapApiPersonRisksForUi(this.application.risks))
    helper.enterCrnDetails()

    const confirmDetailsPage = new ApplyPages.ConfirmDetailsPage(this.person as FullPerson)
    confirmDetailsPage.shouldShowPersonDetails(this.person as FullPerson)
    confirmDetailsPage.clickSaveAndContinue()

    THEN('I should be redirected to the manage applications page')
    const managePage = Page.verifyOnPage(ApplyPages.ManageApplicationsPage, applications)
    managePage.verifyApplicationTable()

    AND('The search endpoint should have been called with the correct parameters')
    cy.task('verifyApiGet', apiPaths.applications.all.pattern).then(result => {
      expect(result[0].queryParams.crnOrName.values).to.deep.equal([this.application.person.crn])
      expect(result[0].queryParams.status.values).to.deep.equal(statusesLimitedToOne)
    })
  })

  it('allows the user to create an application if there are no existing applications for the crn', function test() {
    GIVEN('There are no applications for the crn')
    cy.task('stubAllApplications', { applications: [], anyQuery: true })

    WHEN('I try to create an application')
    const helper = new ApplyHelper(this.application, this.person, this.offences)
    helper.setupApplicationStubs(mapApiPersonRisksForUi(this.application.risks))
    helper.enterCrnDetails()

    const confirmDetailsPage = new ApplyPages.ConfirmDetailsPage(this.person as FullPerson)
    confirmDetailsPage.shouldShowPersonDetails(this.person as FullPerson)
    confirmDetailsPage.clickSaveAndContinue()

    THEN('I should be on the first page of the application flow')
    Page.verifyOnPage(ApplyPages.SelectOffencePage, this.person as FullPerson)
  })
})
