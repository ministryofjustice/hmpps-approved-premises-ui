import { signIn } from '../../signIn'
import {
  activeOffenceFactory,
  cas1OasysGroupFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  risksFactory,
} from '../../../../server/testutils/factories'
import ResidentProfilePage from '../../../pages/manage/placements/residentProfile'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import { DateFormats } from '../../../../server/utils/dateUtils'

context('ResidentProfile', () => {
  describe('show', () => {
    const setup = (placementParameters = {}) => {
      const premises = cas1PremisesBasicSummaryFactory.build()
      const placement = cas1SpaceBookingFactory.upcoming().build({
        ...placementParameters,
        premises: { name: premises.name, id: premises.id },
      })
      const personRisks = risksFactory.build({ roshRisks: { status: 'retrieved' }, flags: { status: 'retrieved' } })

      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      cy.task('stubRiskProfile', { person: placement.person, personRisks })
      cy.task('stubFindPerson', { person: placement.person })

      return {
        placement,
        personRisks,
      }
    }

    beforeEach(() => {
      cy.task('reset')
    })

    it('should show the personal -> personal details tab', () => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      GIVEN('there is an existing placement')
      const { placement, personRisks } = setup()
      WHEN('I visit the resident profile page')
      const page = ResidentProfilePage.visit(placement, personRisks)
      page.clickLink('Personal details')
      THEN('I should see the person information in the header')
      page.checkHeader()
      AND('the Personal tab should be selected')
      page.shouldHaveActiveTab('Personal details')
      page.shouldShowPersonalInformation(placement.person, personRisks, placement)
    })

    it('should show the sentence -> Offence tab', () => {
      const { placement, personRisks } = setup()
      const offences = activeOffenceFactory.buildList(3)
      const oasysOffenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      cy.task('stubPersonOffences', { offences, person: placement.person })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysOffenceDetails })

      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])

      WHEN('I visit the resident profile page on the sentence tab')
      const page = ResidentProfilePage.visit(placement, personRisks)
      page.clickLink('Sentence')

      THEN('I should see the person information in the header')
      page.checkHeader()

      AND('the Sentence tab should be selected')
      page.shouldHaveActiveTab('Sentence')
      AND('the Offences information should be shown')
      page.shouldShowOffencesInformation(offences, oasysOffenceDetails)
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

      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      WHEN('I visit the resident profile page on the risk tab')
      const page = ResidentProfilePage.visit(placement, personRisks)
      page.clickLink('Risk')

      THEN('I should see the person information in the header')
      page.checkHeader()

      AND('the Risk tab should be selected')
      page.shouldHaveActiveTab('Risk')

      AND('the OASys meta-data should be shown')
      page.shouldShowInsetText(
        `OASys last updated on ${DateFormats.isoDateToUIDate(oasysRoshSummary.assessmentMetadata.dateCompleted)}`,
      )

      AND('The ROSH widget should be populated')
      page.shouldShowRoshWidget(personRisks.roshRisks.value)

      AND('the OASys risk cards should be populated')
      page.shouldShowCards(['R10.1', 'R10.2', 'SUM10'], oasysRoshSummary, 'ROSH summary')
      page.shouldShowCards(['RM30', 'RM31', 'RM32', 'RM33'], oasysRiskManagementPlan, 'OASys risk management plan')
      page.shouldShowCards(['2.4.1', '2.4.2'], oasysOffenceDetails, 'OASys')
      page.shouldShowCards(['8.9', '9.9'], oasysSupportingInformation, 'OASys supporting information')
    })

    it('should show the placement tab', () => {
      const { placement } = setup()
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      WHEN('I visit the resident profile page on the placement tab')
      const page = ResidentProfilePage.visit(placement, 'placement')
      THEN('I should see the person information in the header')
      page.checkHeader()

      AND('the placement tab should be selected')
      page.shouldHaveActiveTab('Placement')

      AND('the placement details cards should be shown')
      page.shouldShowPlacementDetails()
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
