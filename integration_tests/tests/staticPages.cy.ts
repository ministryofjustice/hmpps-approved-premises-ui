import Page from '../pages/page'
import AccessibilityStatementPage from '../pages/accessibilityStatement'
import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'
import PrivacyNoticePage from '../pages/privacyNotice'

context('static pages', () => {
  it('renders the accessibility statement', () => {
    signIn('applicant')

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.clickLink('Accessibility statement')

    Page.verifyOnPage(AccessibilityStatementPage)
  })
  it('renders the privacy notice', () => {
    signIn('applicant')

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.clickLink('Privacy notice')

    Page.verifyOnPage(PrivacyNoticePage)
  })
})
