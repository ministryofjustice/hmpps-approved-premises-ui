import { ApprovedPremisesApplication as Application, FullPerson } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem, UserDetails } from '../../@types/ui'
import paths from '../../paths/apply'
import { getStatus } from './getStatus'

export const applicationTitle = (application: Application, pageHeading: string): string => {
  let title = `
    <h1 class="govuk-caption-l">${pageHeading}</h1>
    <h2 class="govuk-heading-l">${(application.person as FullPerson).name}</h2>
  `

  if (application.type === 'Offline') {
    title += '<strong class="govuk-tag govuk-tag--grey govuk-!-margin-5">Offline application</strong>'
  }

  if (application.status === 'withdrawn') {
    title += getStatus(application, 'govuk-!-margin-5')
  }

  return title
}

export const applicationMenuItems = (application: Application, user: UserDetails): Array<IdentityBarMenuItem> => {
  const items: Array<IdentityBarMenuItem> = []

  if (application.createdByUserId === user.id || user.roles.includes('workflow_manager')) {
    if (application.status !== 'withdrawn') {
      items.push({
        text: 'Withdraw application or placement request',
        href: paths.applications.withdraw.new({ id: application.id }),
        classes: 'govuk-button--secondary',
        attributes: {
          'data-cy-withdraw-application': application.id,
        },
      })
    }
  }

  if (user.roles.includes('appeals_manager') && application.status === 'rejected') {
    items.push({
      text: 'Process an appeal',
      href: paths.applications.appeals.new({ id: application.id }),
      classes: 'govuk-button--secondary',
      attributes: {
        'data-cy-appeal-application': application.id,
      },
    })
  }

  return items.length ? items : []
}

export const applicationIdentityBar = (
  application: Application,
  pageHeading: string,
  user: UserDetails,
): IdentityBar => {
  const menuItems = applicationMenuItems(application, user)

  const identityBar: IdentityBar = {
    title: { html: applicationTitle(application, pageHeading) },
    classes: 'application-identity-bar',
  }

  if (menuItems.length) {
    identityBar.menus = [{ items: menuItems }]
  }

  return identityBar
}
