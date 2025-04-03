import { userDetailsFactory } from '../../testutils/factories'
import paths from '../../paths/admin'
import { cruDashboardActions } from './cruDashboardUtils'

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
})
