import { userFactory } from '../../testutils/factories'
import { managementDashboardTableHeader, managementDashboardTableRows } from './tableUtils'
import paths from '../../paths/admin'
import { linkTo, sentenceCase } from '../utils'

describe('tableUtils', () => {
  describe('dashboardTableHeader', () => {
    it('returns the table headers', () => {
      expect(managementDashboardTableHeader()).toEqual([
        {
          text: 'Name',
          attributes: {
            'aria-sort': 'descending',
          },
        },
        {
          text: 'Role',
        },
        {
          text: 'Email',
        },
        { text: 'Region' },
      ])
    })
  })

  describe('managementDashboardTableRows', () => {
    it('returns the table rows', () => {
      const users = userFactory.buildList(1)
      const user = users[0]
      expect(managementDashboardTableRows(users)).toEqual([
        [
          {
            html: linkTo(paths.admin.userManagement.edit, { id: user.id }, { text: user.name }),
          },
          {
            text: user.roles.map(role => sentenceCase(role)).join(', '),
          },
          {
            text: user.email,
          },
          {
            text: user.region.name,
          },
        ],
      ])
    })
  })
})
