import { Cas1ApplicationSummary } from '@approved-premises/api'
import { IdentityBarMenuItem, TableRow } from '@approved-premises/ui'
import paths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'
import { ApplicationShortStatusTag, placementRequestAllowed } from './statusTag'
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
      htmlCell(new ApplicationShortStatusTag(status).html()),
      htmlCell(
        getActions(application, userId)
          .map(({ href, text }) => linkTo(href, { text }))
          .join('<br/>'),
      ),
    ]
  })
}

export const getApplicationTableHeader = () => [
  headerCell('Name'),
  headerCell('Tier', 'none'),
  headerCell('Created on', 'ascending'),
  headerCell('Created by'),
  headerCell('Requested arrival date', 'none'),
  headerCell('Application status', 'none'),
  headerCell('Actions'),
]

export const getApplicationsHeading = (applicationList: Array<Cas1ApplicationSummary>): string =>
  `There ${applicationList.length === 1 ? 'is' : 'are'} ${applicationList.length || 'no'} existing application${applicationList.length === 1 ? '' : 's'} for this CRN`
