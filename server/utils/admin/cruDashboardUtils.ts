import { IdentityBarMenu, UserDetails } from '@approved-premises/ui'
import { hasPermission } from '../users'
import paths from '../../paths/admin'
import { TabItem } from '../tasks/listTable'
import { createQueryString } from '../utils'

export const cruDashboardActions = (user: UserDetails): Array<IdentityBarMenu> =>
  hasPermission(user, ['cas1_premises_capacity_report_view'])
    ? [
        {
          items: [
            {
              text: 'Download CRU occupancy report',
              classes: 'govuk-button--secondary',
              href: paths.admin.cruDashboard.downloadOccupancyReport({}),
              attributes: {
                download: '',
              },
            },
          ],
        },
      ]
    : null

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
      href: `${paths.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          status: 'pendingPlacement',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Ready to match',
      active: activeTab === 'notMatched' || activeTab === undefined || activeTab?.length === 0,
      href: `${paths.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Unable to match',
      active: activeTab === 'unableToMatch',
      href: `${paths.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
          status: 'unableToMatch',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Matched',
      active: activeTab === 'matched',
      href: `${paths.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
          status: 'matched',
        },
        { addQueryPrefix: true },
      )}`,
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
