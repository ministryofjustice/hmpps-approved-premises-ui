import { userDetailsFactory } from '../../testutils/factories'
import paths from '../../paths/admin'
import { cruDashboardActions, cruDashboardTabItems } from './cruDashboardUtils'

describe('CRU dashboard utilities', () => {
  describe('cruDashboardActions', () => {
    it('returns the action to download the CRU occupancy report if the user has the correct permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_premises_capacity_report_view'] })

      expect(cruDashboardActions(user)).toEqual([
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
      ])
    })

    it('returns nothing if the user does nto have the correct permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(cruDashboardActions(user)).toEqual(null)
    })
  })

  describe('cruDashboardTabItems', () => {
    it('returns CRU all dashboard tab items for a user with all permissions', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_change_request_list'] })

      expect(cruDashboardTabItems(user, 'notMatched', 'cru-management-area-id', 'parole')).toEqual([
        {
          active: false,
          text: 'Pending Request for Placement',
          href: `/admin/cru-dashboard?cruManagementArea=cru-management-area-id&status=pendingPlacement`,
        },
        {
          active: true,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=parole',
          text: 'Ready to match',
        },
        {
          active: false,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=parole&status=unableToMatch',
          text: 'Unable to match',
        },
        {
          active: false,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=parole&status=matched',
          text: 'Matched',
        },
        {
          active: false,
          href: '/admin/cru-dashboard/change-requests?cruManagementArea=cru-management-area-id',
          text: 'Change requests',
        },
        {
          active: false,
          href: '/admin/cru-dashboard/search',
          text: 'Search',
        },
      ])
    })

    it('returns CRU dashboard tab items without change requests for a user without change request list permission', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(cruDashboardTabItems(user, 'matched', 'cru-management-area-id', 'standardRelease')).toEqual([
        {
          active: false,
          text: 'Pending Request for Placement',
          href: `/admin/cru-dashboard?cruManagementArea=cru-management-area-id&status=pendingPlacement`,
        },
        {
          active: false,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=standardRelease',
          text: 'Ready to match',
        },
        {
          active: false,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=standardRelease&status=unableToMatch',
          text: 'Unable to match',
        },
        {
          active: true,
          href: '/admin/cru-dashboard?cruManagementArea=cru-management-area-id&requestType=standardRelease&status=matched',
          text: 'Matched',
        },
        {
          active: false,
          href: '/admin/cru-dashboard/search',
          text: 'Search',
        },
      ])
    })
  })
})
