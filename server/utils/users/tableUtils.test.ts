import { userFactory } from '../../testutils/factories'
import {
  allocationCell,
  apAreaCell,
  managementDashboardTableHeader,
  managementDashboardTableRows,
  nameCell,
  roleCell,
} from './tableUtils'
import paths from '../../paths/admin'
import { linkTo } from '../utils'
import { sortHeader } from '../sortHeader'
import { UserSortField } from '../../@types/shared'

describe('tableUtils', () => {
  describe('dashboardTableHeader', () => {
    it('returns the table headers without sorting by default', () => {
      expect(managementDashboardTableHeader()).toEqual([
        {
          text: 'Name',
        },
        {
          text: 'Role',
        },
        {
          text: 'Allocations',
        },
        {
          text: 'Email',
        },
        { text: 'AP Area' },
      ])
    })

    it('returns the table headers with sorting if hrefPrefix is present', () => {
      expect(managementDashboardTableHeader('name', 'desc', 'http://example.com?')).toEqual([
        sortHeader<UserSortField>('Name', 'name', 'name', 'desc', 'http://example.com?'),
        {
          text: 'Role',
        },
        {
          text: 'Allocations',
        },
        {
          text: 'Email',
        },
        { text: 'AP Area' },
      ])
    })
  })

  describe('managementDashboardTableRows', () => {
    it('returns the table rows', () => {
      const users = userFactory.buildList(1, { roles: [], qualifications: [] })
      const user = users[0]
      expect(managementDashboardTableRows(users)).toEqual([
        [
          { html: linkTo(paths.admin.userManagement.edit, { id: user.id }, { text: user.name }) },
          { text: '' },
          { text: 'Standard' },
          { text: user.email },
          { text: user.apArea.name },
        ],
      ])
    })
  })

  describe('nameCell', () => {
    it('returns a cell with the persons name as a link to the edit page', () => {
      const user = userFactory.build()
      expect(nameCell(user)).toEqual({
        html: linkTo(paths.admin.userManagement.edit, { id: user.id }, { text: user.name }),
      })
    })
  })

  describe('roleCell', () => {
    it('returns a cell with the persons roles in sentence case, excluding the allocation roles', () => {
      const user = userFactory.build({
        roles: [
          'assessor',
          'matcher',
          'workflow_manager',
          'role_admin',

          'excluded_from_assess_allocation',
          'excluded_from_match_allocation',
          'excluded_from_placement_application_allocation',
        ],
      })
      expect(roleCell(user)).toEqual({
        text: 'Assessor, Matcher, Workflow manager, Administrator',
      })
    })
  })

  describe('allocationCell', () => {
    it('returns a cell with the persons allocations: a combination of certain roles and all qualifications in sentence case when the user has roles', () => {
      const user = userFactory.build({
        roles: [
          'assessor',
          'matcher',
          'workflow_manager',
          'applicant',
          'role_admin',
          'report_viewer',
          'excluded_from_assess_allocation',
          'excluded_from_match_allocation',
          'excluded_from_placement_application_allocation',
        ],
        qualifications: ['emergency', 'esap', 'pipe', 'lao'],
      })
      expect(allocationCell(user)).toEqual({
        text: 'Stop assessment allocations, Stop match allocations, Stop placement request allocations, Emergency APs, ESAP, PIPE, Limited access offenders',
      })
    })

    it('returns "standard" if the user doesnt have any specific allocations', () => {
      const user = userFactory.build({
        roles: [],
        qualifications: [],
      })
      expect(allocationCell(user)).toEqual({
        text: 'Standard',
      })
    })
  })

  describe('apAreaCell', () => {
    it('returns the AP Area for the user', () => {
      const user = userFactory.build()
      expect(apAreaCell(user)).toEqual({
        text: user.apArea.name,
      })
    })
  })
})
