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
})
