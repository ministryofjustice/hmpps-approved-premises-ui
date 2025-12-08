import { signIn } from '../../signIn'
import {
  activeOffenceFactory,
  cas1OasysGroupFactory,
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingShortSummaryFactory,
  cas1SpaceBookingDepartureFactory,
} from '../../../../server/testutils/factories'
import ResidentProfilePage from '../../../pages/manage/placements/residentProfile'
import { AND, GIVEN, THEN, WHEN } from '../../../helpers'

context('ResidentProfile', () => {
  describe('show', () => {
    const setup = (placementParameters = {}) => {
      const premises = cas1PremisesBasicSummaryFactory.build()
      const placement = cas1SpaceBookingFactory.upcoming().build({
        ...placementParameters,
        premises: { name: premises.name, id: premises.id },
      })

      const offences = activeOffenceFactory.buildList(3)
      const oasysOffenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      oasysOffenceDetails.answers[0].questionNumber = '2.1'
      oasysOffenceDetails.answers[1].questionNumber = '2.12'

      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      cy.task('stubPersonOffences', { offences, person: placement.person })
      cy.task('stubOasysGroup', { person: placement.person, group: oasysOffenceDetails })
      return {
        placement,
        offences,
        oasysOffenceDetails,
      }
    }

    beforeEach(() => {
      cy.task('reset')
    })

    it('should render the resident profile page on the default tab', () => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      GIVEN('there is an existing placement')
      const { placement } = setup()
      WHEN('I visit the resident profile page')
      const page = ResidentProfilePage.visit(placement, 'personal')
      THEN('I should see the person information in the header')
      page.checkHeader()
      AND('the Personal tab should be selected')
      page.shouldHaveActiveTab('Personal details')
    })

    it('should show the sentence tab', () => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      GIVEN('there is an existing placement')
      const { placement, offences, oasysOffenceDetails } = setup()
      WHEN('I visit the resident profile page on the sentence tab')
      const page = ResidentProfilePage.visit(placement, 'sentence')
      THEN('I should see the person information in the header')
      page.checkHeader()
      AND('the Sentence tab should be selected')
      page.shouldHaveActiveTab('Sentence')
      AND('the Offences information should be shown')
      page.shouldShowOffencesInformation(offences, oasysOffenceDetails)
    })

    it('should show the Placement/AP stays tab', () => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      GIVEN('there is an existing placement')
      const { placement } = setup()

      AND('there are previous AP stays for the person')
      const previousStays = [
        cas1SpaceBookingShortSummaryFactory.departed().build({
          departure: cas1SpaceBookingDepartureFactory.build(),
        }),
        cas1SpaceBookingShortSummaryFactory.nonArrival().build(),
        cas1SpaceBookingShortSummaryFactory.upcoming().build(),
      ]

      cy.task('stubPersonSpaceBookings', {
        person: placement.person,
        spaceBookings: previousStays,
        includeCancelled: false,
      })

      WHEN('I visit the resident profile page on the placement tab')
      const page = ResidentProfilePage.visit(placement, 'placement')
      THEN('I should see the person information in the header')
      page.checkHeader()
      AND('the Placement tab should be selected')
      page.shouldHaveActiveTab('Placement')
      AND('the side navigation should show Previous AP stays')
      page.shouldShowPlacementSideNavigation()
      AND('the Previous AP stays information should be shown')
      page.shouldShowPreviousApStaysInformation(previousStays, placement.id)
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
