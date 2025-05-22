import { IdentityBarMenu, UserDetails } from '@approved-premises/ui'
import { hasPermission } from '../users'
import paths from '../../paths/admin'
import pathsAdmin from '../../paths/admin'
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
  activeTab?: string,
  cruManagementArea?: string,
  requestType?: string,
): Array<TabItem> => {
  return [
    {
      text: 'Pending Request for Placement',
      active: activeTab === 'pendingPlacement',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
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
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
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
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
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
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
          status: 'matched',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Change requests',
      active: activeTab === 'changeRequests',
      href: `${pathsAdmin.admin.cruDashboard.changeRequests({})}${createQueryString(
        { cruManagementArea },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Search',
      active: activeTab === 'search',
      href: pathsAdmin.admin.cruDashboard.search({}),
    },
  ]
}
