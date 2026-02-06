import { signIn } from '../../signIn'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  applicationFactory,
  assessmentFactory,
  cas1OasysGroupFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingShortSummaryFactory,
  csraSummaryFactory,
  licenceFactory,
  personFactory,
  risksFactory,
} from '../../../../server/testutils/factories'
import ResidentProfilePage from '../../../pages/manage/placements/residentProfile'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { fullPersonFactory, restrictedPersonFactory } from '../../../../server/testutils/factories/person'
import applicationDocument from '../../../fixtures/applicationDocument.json'
import assessPaths from '../../../../server/paths/assess'

context('ResidentProfile', () => {
  describe('show', () => {
    const setup = (placementParameters = {}) => {
      const premises = cas1PremisesBasicSummaryFactory.build()
      const placement = cas1SpaceBookingFactory.upcoming().build({
        ...placementParameters,
        premises: { name: premises.name, id: premises.id },
      })
      const personRisks = risksFactory.build({ roshRisks: { status: 'retrieved' }, flags: { status: 'retrieved' } })
      GIVEN('there is an existing placement and the person has a risk profile')
      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      cy.task('stubSpaceBookingShow', placement)
      cy.task('stubRiskProfile', { person: placement.person, personRisks })
      cy.task('stubFindPerson', { person: placement.person })
      return {
        placement,
        personRisks,
      }
    }

    const visitPage = ({ placement, personRisks }, tab?: string): ResidentProfilePage => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident', 'future_manager'])

      WHEN('I visit the resident profile page')
      const page = ResidentProfilePage.visit(placement, personRisks)
      THEN('I should see the person information in the header')
      page.checkHeader()

      if (tab) {
        AND(`select the ${tab} tab`)
        page.clickTab(tab)
      }
      return page
    }

    beforeEach(() => {
      cy.task('reset')
    })

    it('should show the personal -> personal details tab', () => {
      const { placement, personRisks } = setup({})
      const page = visitPage({ placement, personRisks })

      THEN('the Personal tab should be selected')
      page.shouldHaveActiveTab('Personal details')
      page.shouldShowPersonalInformation(placement.person, personRisks)

      WHEN('I click the contacts subtab')
      page.clickSideNav('Contacts')

      THEN('I should see the contacts section')
      page.shouldShowContacts(placement.person)
    })

    it('should show the health tab', () => {
      const { placement, personRisks } = setup({})
      const acctAlerts = acctAlertFactory.buildList(5)
      const oasysSupportingInformation = cas1OasysGroupFactory.supportingInformation().build()
      const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()

      cy.task('stubAcctAlerts', { person: placement.person, acctAlerts })
      cy.task('stubOasysGroup', { person: placement.person, group: riskToSelf })
      cy.task('stubOasysGroup', {
        person: placement.person,
        group: oasysSupportingInformation,
        includeOptionalSections: [13],
      })

      const page = visitPage({ placement, personRisks })

      WHEN('I click the Health tab')
      page.clickTab('Health')

      THEN('I should see the Health details section')
      page.shouldHaveActiveTab('Health')
      page.shouldHaveActiveSideNav(`Health and disability`)

      WHEN('I select the Mental health subtab')
      page.clickSideNav('Mental health')

      THEN('I should see the Mental health cards')
      page.shouldHaveActiveSideNav(`Mental health`)
      page.shouldShowMentalHealthSection(acctAlerts, riskToSelf)
    })

    it('should show the drug and alcohol tab', () => {
      const { placement, personRisks } = setup({})
      const oasysSupportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      cy.task('stubOasysGroup', {
        person: placement.person,
        group: oasysSupportingInformation,
        includeOptionalSections: [8, 9],
      })

      const page = visitPage({ placement, personRisks })

      WHEN('I click the Drug and alcohol tab')
      page.clickTab('Drug and alcohol')

      THEN('I should see the Drug and alcohol section')
      page.shouldHaveActiveTab('Drug and alcohol')
      page.shouldShowOasysCards(['8.9', '9.9'], oasysSupportingInformation, 'OASys supporting information')
    })

    it('should show the placement tab', () => {
      const { placement, personRisks } = setup()
      const assessment = assessmentFactory.build()
      const application = applicationFactory.completed('accepted').build({
        person: fullPersonFactory.build(),
        document: applicationDocument,
        assessmentId: assessment.id,
      })
      placement.applicationId = application.id
      placement.assessmentId = assessment.id
      cy.task('stubApplicationGet', { application })
      cy.task('stubAssessment', assessment)

      const spaceBookings = [
        cas1SpaceBookingShortSummaryFactory.upcoming().build(),
        cas1SpaceBookingShortSummaryFactory.current().build(),
        cas1SpaceBookingShortSummaryFactory.departed().build(),
      ]
      cy.task('stubPersonSpaceBookings', { person: placement.person, spaceBookings })

      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])

      WHEN('I visit the resident profile page on the placement tab')
      const page = ResidentProfilePage.visit(placement, personRisks)
      page.clickTab('Placement')

      THEN('I should see the person information in the header')
      page.checkHeader()

      AND('the placement tab should be selected')
      page.shouldHaveActiveTab('Placement')
      page.shouldHaveActiveSideNav(`${placement.premises.name} placement`)

      AND('the placement details cards should be shown')
      page.shouldShowPlacementDetails()

      WHEN('I select the Application and assessment sidenav')
      page.clickSideNav('Application and assessment')

      THEN('I should see the application details')
      page.shouldHaveActiveSideNav(`Application and assessment`)
      page.shouldShowApplication(application)

      AND('I should see the assessment link')
      cy.get('a')
        .contains('View assessment')
        .should('have.attr', 'href', assessPaths.assessments.show({ id: assessment.id }))

      WHEN('I click on the All AP placements side nav')
      page.clickSideNav('All AP placements')

      THEN('the All AP placements side nav should be active')
      page.shouldHaveActiveSideNav('All AP placements')

      AND('I should see all the placement cards with their details')
      page.shouldShowAllApPlacements(spaceBookings)
    })

    it('should show the sentence tab', () => {
      const offences = activeOffenceFactory.buildList(3)
      const oasysOffenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      const adjudications = adjudicationFactory.buildList(5)
      const licence = licenceFactory.build()
      const csraSummaries = csraSummaryFactory.buildList(2)
      const { placement, personRisks } = setup()

      cy.task('stubPersonOffences', { offences, person: placement.person })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysOffenceDetails })
      cy.task('stubAdjudications', { person: placement.person, adjudications })
      cy.task('stubLicence', { person: placement.person, licence })
      cy.task('stubCsra', { person: placement.person, csraSummaries })
      cy.task('stubFindPerson', { person: placement.person })

      const page = visitPage({ placement, personRisks }, 'Sentence')

      AND('the Sentence tab should be selected')
      page.shouldHaveActiveTab('Sentence')

      AND('the Offence details information should be shown')
      page.shouldShowOffencesInformation(offences, oasysOffenceDetails, placement)

      WHEN('I select the licence side-nav')
      page.clickSideNav('Licence')

      THEN('I should see the licence information')
      page.shouldShowLicenceInformation(licence)

      WHEN('I select the prison sub-tab')
      page.clickSideNav('Prison')

      THEN('I should see the prison cards')
      page.shouldShowPrisonInformation(adjudications, csraSummaries, placement.person)
    })

    it('should show the risk tab', () => {
      const { placement, personRisks } = setup()
      const oasysOffenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      const oasysRoshSummary = cas1OasysGroupFactory.roshSummary().build()
      const oasysRiskManagementPlan = cas1OasysGroupFactory.riskManagementPlan().build()

      cy.task('stubOasysGroup', { person: placement.person, group: oasysOffenceDetails })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysRoshSummary })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysRiskManagementPlan })

      const page = visitPage({ placement, personRisks }, 'Risk')

      THEN('the Risk tab should be selected')
      page.shouldHaveActiveTab('Risk')

      AND('the OASys meta-data should be shown')
      page.shouldShowInsetText(
        `OASys last updated on ${DateFormats.isoDateToUIDate(oasysRoshSummary.assessmentMetadata.dateCompleted)}`,
      )

      AND('The Ndelius risk card should be populated')
      page.shouldShowNDeliusRiskCard(placement, personRisks)

      AND('The ROSH widget should be populated')
      page.shouldShowRoshWidget(personRisks.roshRisks.value)

      AND('the OASys risk cards should be populated')
      page.shouldShowOasysCards(['R10.1', 'R10.2', 'SUM10'], oasysRoshSummary, 'ROSH summary')
      page.shouldShowOasysCards(['RM30', 'RM31', 'RM32', 'RM33'], oasysRiskManagementPlan, 'OASys risk management plan')
      page.shouldShowOasysCards(['2.4.1', '2.4.2'], oasysOffenceDetails, 'OASys')
    })

    it('should render the tabs if there are no external data', () => {
      const { placement, personRisks } = setup()
      cy.task('stubOasysGroup404', { person: placement.person })
      cy.task('stubAdjudications404', { person: placement.person })
      cy.task('stubPersonOffences404', { person: placement.person })
      cy.task('stubCsra404', { person: placement.person })

      const page = visitPage({ placement, personRisks })

      THEN('The page should render')
      page.shouldHaveActiveTab('Personal details')

      WHEN('I select the risk tab')
      page.clickTab('Risk')
      THEN('The Risk tab should be selected')
      page.shouldHaveActiveTab('Risk')
      cy.contains('No OASys risk assessment for person added')

      WHEN('I select the sentence tab')
      page.clickTab('Sentence')
      THEN('The Sentence tab should be selected')
      page.shouldHaveActiveTab('Sentence')
      cy.contains('No offence information found in NDelius')

      WHEN('I select the prison side-tab')
      page.clickSideNav('Prison')
      page.shouldHaveActiveSideNav('Prison')

      cy.contains('No adjudication information found in Digital Prison Service')
    })

    it('should not allow access to the page if user lacks permission', () => {
      const { placement } = setup()
      GIVEN(' that I am signed in as a user without access to the resident profile')
      signIn(['applicant'])
      WHEN('I visit the resident profile page')
      ResidentProfilePage.visitUnauthorised(placement)
    })

    it("should show an error if the CRN in the URL doesn't match the CRN on the placement's user", () => {
      const { placement } = setup()
      GIVEN(' that I am signed in as a user with access to the resident profile')
      signIn(['manage_resident'])
      WHEN('I visit the resident profile page with mismatched CRNs')
      THEN('I should see an error')
      ResidentProfilePage.visitCrnMismatch('X123456', placement)
    })

    it('should allow the user to access actions and return to the profile page on hitting back', () => {
      const { placement, personRisks } = setup()
      WHEN('I visit the resident profile page')
      const page = visitPage({ placement, personRisks }, 'Placement')
      WHEN('I navigate to record an arrival')
      page.clickAction('Record arrival')
      THEN('The backlink should return me to the resident profile')
      page.shouldHaveCorrectReturnPath(placement)
    })

    it('should show LAO prefixed offender where the user is whitelisted', () => {
      const person = personFactory.build({ isRestricted: true })
      const { placement, personRisks } = setup({ person })
      WHEN('I visit the resident profile page for an LAO person that I am whitelisted for')
      visitPage({ placement, personRisks })
      THEN('I should see a prefix before the name')
      cy.get('h2').contains(`LAO: ${person.name}`)
    })

    it('should error if the person is blacklisted', () => {
      const person = restrictedPersonFactory.build()
      const { placement } = setup({ person })
      GIVEN(' that I am signed in as a user with access to the resident profile')
      signIn(['manage_resident'])
      WHEN('I visit the resident profile page for an LAO person that I am not whitelisted for')
      THEN('I should see an error')
      ResidentProfilePage.visitRestrictedPerson(placement)
    })
  })
})
