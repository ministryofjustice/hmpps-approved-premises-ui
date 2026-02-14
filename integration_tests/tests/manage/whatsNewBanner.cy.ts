import { signIn } from '../signIn'

context(`what's new banner`, () => {
  describe("what's new top banner", () => {
    afterEach(() => {
      cy.clearCookie('technical-updates-banner')
    })

    it('shows the banner on manage pages', () => {
      signIn(['future_manager'])

      cy.visit('/manage/premises', { failOnStatusCode: false })

      cy.get('#technical-updates-banner').should('be.visible').and('contain', 'New features')
    })

    it('does not show the banner on non-manage pages', () => {
      signIn(['future_manager'])

      cy.get('#technical-updates-banner').should('not.exist')
    })

    it('does not show the banner to users without manage resident permission', () => {
      signIn(['applicant'])
      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('not.exist')
    })

    it('hides the banner after visiting whats-new page', () => {
      signIn(['future_manager'])

      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('be.visible')

      cy.visit('/whats-new')

      cy.visit('/manage/premises', { failOnStatusCode: false })
      cy.get('#technical-updates-banner').should('not.exist')
    })
  })
})
