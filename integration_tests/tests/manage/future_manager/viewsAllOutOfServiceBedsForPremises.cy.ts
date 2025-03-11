import { outOfServiceBedFactory, premisesFactory } from '../../../../server/testutils/factories'
import Page from '../../../pages/page'
import { OutOfServiceBedPremisesIndexPage } from '../../../pages/manage/outOfServiceBeds'
import { signIn } from '../../signIn'

describe('Future Manager lists all OOS beds for a particular premises', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member with OOSB permissions
    signIn({ permissions: ['cas1_view_out_of_service_beds'] })
  })

  const outOfServiceBeds = outOfServiceBedFactory.buildList(10)
  const premises = premisesFactory.build({ name: 'Hope House' })

  it('allows me to view all out of service beds for a given premises', () => {
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1, perPage: 50, premisesId: premises.id })
    cy.task('stubSinglePremises', premises)

    // Given I am on the out-of-service bed list for the premises
    OutOfServiceBedPremisesIndexPage.visit(premises)

    // Then I should see the list of out-of-service beds for the premises
    const page = Page.verifyOnPage(OutOfServiceBedPremisesIndexPage, premises)

    // And I should see the count of total results (not limited to page)
    page.hasCountOfAllResultsMatchingFilter()
  })
})
