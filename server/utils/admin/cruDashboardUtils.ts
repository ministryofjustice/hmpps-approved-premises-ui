import { IdentityBarMenu, UserDetails } from '@approved-premises/ui'
import { ParsedQs } from 'qs'
import { hasPermission } from '../users'
import paths from '../../paths/admin'
import { TabItem } from '../tasks/listTable'
import { createQueryString } from '../utils'

export const cruDashboardActions = (user: UserDetails): Array<IdentityBarMenu> => {
  const reportView = {
    text: 'Download CRU occupancy report',
    classes: 'govuk-button--secondary',
    href: paths.admin.cruDashboard.downloadOccupancyReport({}),
    attributes: {
      download: '',
    },
  }
  const nationalOccupancy = {
    text: 'View all approved premises spaces',
    classes: 'govuk-button--secondary',
    href: paths.admin.nationalOccupancy.weekView({}),
  }
  const items = [
    hasPermission(user, ['cas1_premises_capacity_report_view']) && reportView,
    hasPermission(user, ['cas1_national_occupancy_view']) && nationalOccupancy,
  ].filter(Boolean)
  return items.length ? [{ items }] : null
}

const cruDashboardTabLink = (query: ParsedQs) =>
  `${paths.admin.cruDashboard.index({})}${createQueryString(query, { addQueryPrefix: true })}`

export const cruDashboardTabItems = (
  user: UserDetails,
  activeTab?: string,
  cruManagementArea?: string,
  requestType?: string,
): Array<TabItem> => {
  return [
    {
      text: 'Pending Request for Placement',
      active: activeTab === 'pendingPlacement',
      href: cruDashboardTabLink({ cruManagementArea, status: 'pendingPlacement' }),
    },
    {
      text: 'Ready to match',
      active: activeTab === 'notMatched' || activeTab === undefined || activeTab?.length === 0,
      href: cruDashboardTabLink({ cruManagementArea, requestType }),
    },
    {
      text: 'Unable to match',
      active: activeTab === 'unableToMatch',
      href: cruDashboardTabLink({ cruManagementArea, requestType, status: 'unableToMatch' }),
    },
    {
      text: 'Matched',
      active: activeTab === 'matched',
      href: cruDashboardTabLink({ cruManagementArea, requestType, status: 'matched' }),
    },
    hasPermission(user, ['cas1_change_request_list'])
      ? {
          text: 'Change requests',
          active: activeTab === 'changeRequests',
          href: `${paths.admin.cruDashboard.changeRequests({})}${createQueryString(
            { cruManagementArea },
            { addQueryPrefix: true },
          )}`,
        }
      : undefined,
    {
      text: 'Search',
      active: activeTab === 'search',
      href: paths.admin.cruDashboard.search({}),
    },
  ].filter(Boolean)
}
