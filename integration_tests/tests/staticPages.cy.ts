import Page from '../pages/page'
import AccessibilityStatementPage from '../pages/accessibilityStatement'
import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'

context('static pages', () => {
  it('renders the accessibility statement', () => {
    signIn('applicant')

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.clickLink('Accessibility')

    Page.verifyOnPage(AccessibilityStatementPage)
  })
})
