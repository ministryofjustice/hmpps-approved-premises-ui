import { Cas1ApplicationSummary } from '@approved-premises/api'
import { IdentityBarMenuItem, TableCell, TableRow } from '@approved-premises/ui'
import paths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'
import { ApplicationStatusShortTag, placementRequestAllowed } from './statusTag'
import { createQueryString, linkTo } from '../utils'
import { dateCellSortable, htmlCell, nameCellLink, textCell, tierCell } from '../tableUtils'

export const nameCell = ({ id, person, status }: Partial<Cas1ApplicationSummary>) =>
  nameCellLink(person, status !== 'started' ? paths.applications.show({ id }) : undefined)

const headerCell = (value: string, sort?: string) => ({ text: value, attributes: sort && { 'aria-sort': sort } })

export const getActions = (
  { id, status, hasRequestsForPlacement, createdByUserId }: Partial<Cas1ApplicationSummary>,
  userId: string,
): Array<IdentityBarMenuItem> => {
  const ownApplication = userId === createdByUserId

  return [
    placementRequestAllowed.includes(status) && {
      text: 'Create placement request',
      href: placementApplicationPaths.placementApplications.create({}) + createQueryString({ id }),
    },

    ownApplication &&
      status === 'started' && {
        text: 'Continue application',
        href: paths.applications.show({ id }),
      },
    hasRequestsForPlacement || !ownApplication
      ? { text: 'Expire application', href: paths.applications.expire({ id }) }
      : { text: 'Withdraw application', href: paths.applications.withdraw.new({ id }) },
  ].filter(Boolean)
}
export const actionsCell = (actions: Array<IdentityBarMenuItem>): TableCell =>
  htmlCell(`<ul class="govuk-list govuk-list--spaced">
        ${actions.map(({ href, text }) => `<li>${linkTo(href, { text })}</li>`).join('')}
      </ul>`)

export const getApplicationTableRows = (
  applicationList: Array<Cas1ApplicationSummary>,
  userId: string,
): Array<TableRow> => {
  return applicationList.map(application => {
    const { createdAt, arrivalDate, status, createdByUserName, tier } = application

    return [
      nameCell(application),
      tierCell(tier),
      dateCellSortable(createdAt),
      textCell(createdByUserName),
      dateCellSortable(arrivalDate),
      htmlCell(new ApplicationStatusShortTag(status).html()),
      actionsCell(getActions(application, userId)),
    ]
  })
}

export const getApplicationTableHeader = () => [
  headerCell('Name'),
  headerCell('Tier', 'none'),
  headerCell('Created on', 'ascending'),
  headerCell('Created by', 'none'),
  headerCell('Requested arrival date', 'none'),
  headerCell('Application status', 'none'),
  headerCell('Actions'),
]

export const getApplicationsHeading = (applicationList: Array<Cas1ApplicationSummary>): string =>
  `There ${applicationList.length === 1 ? 'is' : 'are'} ${applicationList.length || 'no'} existing application${applicationList.length === 1 ? '' : 's'} for this CRN`
