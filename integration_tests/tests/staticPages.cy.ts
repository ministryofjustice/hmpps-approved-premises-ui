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
      cy.clearLocalStorage('whats-new-top-banner-hidden')
    })

    it('shows the banner by default', () => {
      signIn('applicant')

      cy.get('#whats-new-top-banner').should('be.visible').and('contain', 'New features')
    })

    it("hides the banner when clicking 'Hide message'", () => {
      signIn('applicant')

      cy.get('#whats-new-top-banner').should('be.visible')
      cy.get('#hide-message').click()
      cy.get('#whats-new-top-banner').should('not.be.visible')
    })

    it("hides the banner when clicking 'Whats new' and navigates to the page", () => {
      signIn('applicant')

      cy.get('#whats-new-top-banner').should('be.visible')
      cy.get('#whats-new-top-banner a[href="/whats-new"]').click()
      Page.verifyOnPage(Page, "What's new")
      cy.get('#whats-new-top-banner').should('not.be.visible')
    })
  })
})
