import { IdentityBarMenu, UserDetails } from '@approved-premises/ui'
import { hasPermission } from '../users'
import paths from '../../paths/admin'

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
