import { signIn } from '../../signIn'
import {
  activeOffenceFactory,
  adjudicationFactory,
  applicationFactory,
  cas1OasysGroupFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingShortSummaryFactory,
  csraSummaryFactory,
  licenceFactory,
  risksFactory,
} from '../../../../server/testutils/factories'
import ResidentProfilePage from '../../../pages/manage/placements/residentProfile'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { fullPersonFactory } from '../../../../server/testutils/factories/person'
import applicationDocument from '../../../fixtures/applicationDocument.json'

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
      cy.task('stubRiskProfile', { person: placement.person, personRisks })
      cy.task('stubFindPerson', { person: placement.person })
      return {
        placement,
        personRisks,
      }
    }

    const visitPage = ({ placement, personRisks }, tab?: string): ResidentProfilePage => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])

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

    it('should show the placement tab', () => {
      const { placement, personRisks } = setup()
      const application = applicationFactory.completed('accepted').build({
        person: fullPersonFactory.build(),
        document: applicationDocument,
      })
      placement.applicationId = application.id
      cy.task('stubApplicationGet', { application })

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
      page.clickLink('Placement')

      THEN('I should see the person information in the header')
      page.checkHeader()

      AND('the placement tab should be selected')
      page.shouldHaveActiveTab('Placement')
      page.shouldHaveActiveSideNav(`${placement.premises.name} placement`)

      AND('the placement details cards should be shown')
      page.shouldShowPlacementDetails()

      WHEN('I select the Application sidenav')
      page.clickLink('Application')

      THEN('I should see the application details')
      page.shouldHaveActiveSideNav(`Application`)
      page.shouldShowApplication(application)

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
      AND('the Offences information should be shown')
      page.shouldShowOffencesInformation(offences, oasysOffenceDetails)

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
      const oasysSupportingInformation = cas1OasysGroupFactory.supportingInformation().build()
      cy.task('stubOasysGroup', { person: placement.person, group: oasysOffenceDetails })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysRoshSummary })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysRiskManagementPlan })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysSupportingInformation })

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
      page.shouldShowOasysCards(['8.9', '9.9'], oasysSupportingInformation, 'OASys supporting information')
    })

    it('should render the page tab if there are no external data', () => {
      const { placement, personRisks } = setup()
      cy.task('stubOasysGroup404', { person: placement.person })
      cy.task('stubAdjudications404', { person: placement.person })
      cy.task('stubPersonOffences404', { person: placement.person })

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
      cy.contains('No offences found')
      cy.contains('OASys question 2.1 not available')

      WHEN('I select the prison side-tab')
      page.clickSideNav('Prison')
      page.shouldHaveActiveSideNav('Prison')

      cy.contains('No adjudications found')
    })

    it('should not allow access to the page if user lacks permission', () => {
      const { placement } = setup()
      GIVEN(' that I am signed in as a user without access to the resident profile')
      signIn(['applicant'])
      WHEN('I visit the resident profile page')
      ResidentProfilePage.visitUnauthorised(placement)
    })
  })
})
