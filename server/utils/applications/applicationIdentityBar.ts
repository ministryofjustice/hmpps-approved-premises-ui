import { ApprovedPremisesApplication as Application, FullPerson } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem, UserDetails } from '../../@types/ui'
import paths from '../../paths/apply'
import { ApplicationStatusTag } from './statusTag'
import { hasPermission } from '../users'

export const applicationTitle = (application: Application, pageHeading: string): string => {
  let heading = (application.person as FullPerson).name

  if (application.type === 'Offline') {
    heading += '<strong class="govuk-tag govuk-tag--grey govuk-!-margin-5">Offline application</strong>'
  }

  if (application.status === 'withdrawn') {
    heading += new ApplicationStatusTag(application.status, { addLeftMargin: true }).html()
  }

  return `
    <h1 class="govuk-caption-l">${pageHeading}</h1>
    <h2 class="govuk-heading-l">${heading}</h2>
    <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
  `
}

export const applicationMenuItems = (application: Application, user: UserDetails): Array<IdentityBarMenuItem> => {
  const items: Array<IdentityBarMenuItem> = []

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

  if (hasPermission(user, ['cas1_process_an_appeal']) && application.status === 'rejected') {
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
