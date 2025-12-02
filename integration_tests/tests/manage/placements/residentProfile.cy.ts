import { signIn } from '../../signIn'
import { cas1PremisesBasicSummaryFactory, cas1SpaceBookingFactory } from '../../../../server/testutils/factories'
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

      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      return {
        placement,
      }
    }

    beforeEach(() => {
      cy.task('reset')
    })

    it('should render the resident profile page', () => {
      GIVEN(' that I am signed in as a user with access resident profile')
      signIn(['manage_resident'])
      GIVEN('there is an existing placement')
      const { placement } = setup()
      WHEN('I visit the resident profile page')
      const page = ResidentProfilePage.visit(placement, 'personal')
      THEN('I should see the person information in the header')
      page.checkHeader()
      AND('the Personal tab should be selected')
      page.shouldHaveActiveTab('Personal')
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
