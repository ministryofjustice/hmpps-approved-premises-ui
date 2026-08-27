import { applicationFactory, risksFactory } from '../../../server/testutils/factories'
import ApplyHelper from '../../helpers/apply'
import { ListPage } from '../../pages/apply'
import Page from '../../pages/page'
import SubmissionConfirmation from '../../pages/apply/submissionConfirmation'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import { setup } from './setup'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Apply', () => {
  beforeEach(setup)

  it('allows completion of the form', function test() {
    AND('I complete the application')
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeApplication()

    THEN('the application should be submitted to the API')
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(apply.numberOfPages())
      const body = JSON.parse(requests[requests.length - 1].body)
      expect(body).to.have.keys(
        'data',
        'document',
        'duration',
        'requestedPlacementPeriod',
        'apType',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'isInapplicable',
        'isEmergencyApplication',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
      expect(body.data).to.deep.equal(this.applicationData)
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/cas1/applications/${this.application.id}/submission`)

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys(
        'requestedPlacementPeriod',
        'duration',
        'translatedDocument',
        'apType',
        'isEmergencyApplication',
        'isWomensApplication',
        'targetLocation',
        'releaseType',
        'sentenceType',
        'situation',
        'type',
        'apAreaId',
        'applicantUserDetails',
        'caseManagerIsNotApplicant',
        'caseManagerUserDetails',
        'noticeType',
        'licenseExpiryDate',
      )
    })

    AND('I should be taken to the confirmation page')
    const confirmationPage = new SubmissionConfirmation()

    GIVEN('there are applications in the database')
    const applications = applicationFactory.withReleaseDate().buildList(5)
    cy.task('stubApplications', applications)

    AND('there are risks in the database')
    const risks = risksFactory.buildList(5)
    applications.forEach((stubbedApplication, i) => {
      cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
    })

    WHEN("I click 'Back to dashboard'")
    confirmationPage.clickBackToDashboard()

    THEN('I am taken back to the dashboard')
    Page.verifyOnPage(ListPage)
  })

  it('shows the user a message if there are no documents imported from Delius', function test() {
    GIVEN('I complete the documents selection of application')
    const uiRisks = mapApiPersonRisksForUi(this.application.risks)
    const apply = new ApplyHelper(this.application, this.person, this.offences)

    apply.setupApplicationStubs(uiRisks)

    AND('no documents uploaded to the application')
    apply.stubDocumentEndpoints([])
    apply.startApplication()
    apply.completeApplication({ isNoDocuments: true })

    THEN('should display No documents have been imported from Delius message will be displayed')
    apply.verifyNoDocumentsDisplayed()
  })
})
