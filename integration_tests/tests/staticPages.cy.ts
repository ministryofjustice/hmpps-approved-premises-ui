import Page from '../pages/page'
import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'

context('static pages', () => {
  it('renders the static accesibility statement', () => {
    signIn('applicant')

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.clickLink('Accessibility statement')

    Page.verifyOnPage(Page, 'Accessibility statement')
  })

  it('renders the cookies policy', () => {
    signIn('applicant')

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.clickLink('Cookies policy')

    Page.verifyOnPage(Page, 'Cookies policy')
  })

  it("renders the what's new page", () => {
    signIn('applicant')

    cy.visit('/whats-new')

    Page.verifyOnPage(Page, "What's new")
  })

  describe("what's new top banner", () => {
    beforeEach(() => {
      cy.clearCookie('technical-updates-banner')
    })

    it('shows the banner on manage pages', () => {
      signIn(['future_manager', 'manage_resident'])

      cy.visit('/manage/premises', { failOnStatusCode: false })

      cy.get('#technical-updates-banner').should('be.visible').and('contain', 'New features')
    })

    it('does not show the banner on non-manage pages', () => {
      signIn(['future_manager', 'manage_resident'])

      cy.get('#technical-updates-banner').should('not.exist')
    })

    it('does not show the banner to users without manage resident permission', () => {
      signIn(['future_manager'])
      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('not.exist')
    })

    it('hides the banner after visiting whats-new page', () => {
      signIn(['future_manager', 'manage_resident'])

      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('be.visible')

      cy.visit('/whats-new')

      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('not.exist')
    })
  })
})
