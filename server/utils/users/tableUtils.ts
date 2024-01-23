import { SortDirection, ApprovedPremisesUser as User, UserSortField } from '../../@types/shared'
import { TableCell } from '../../@types/ui'
import paths from '../../paths/admin'
import { sortHeader } from '../sortHeader'
import { emailCell } from '../tableUtils'
import { linkTo } from '../utils'
import {
  allocationRoleLabelDictionary,
  filterAllocationRoles,
  qualificationDictionary,
  roleLabelDictionary,
} from './roleCheckboxes'

export const managementDashboardTableHeader = (
  sortBy: UserSortField | undefined = undefined,
  sortDirection: SortDirection | undefined = undefined,
  hrefPrefix: string | undefined = undefined,
): Array<TableCell> => {
  return [
    hrefPrefix === undefined
      ? {
          text: 'Name',
        }
      : sortHeader<UserSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Role',
    },
    { text: 'Allocations' },
    {
      text: 'Email',
    },
    { text: 'AP Area' },
  ]
}

export const managementDashboardTableRows = (users: Array<User>): Array<Array<TableCell>> => {
  return users.map(user => [nameCell(user), roleCell(user), allocationCell(user), emailCell(user), apAreaCell(user)])
}

export const nameCell = (user: User): TableCell => {
  return {
    html: linkTo(paths.admin.userManagement.edit, { id: user.id }, { text: user.name }),
  }
}

export const roleCell = (user: User): TableCell => {
  return {
    text: filterAllocationRoles(user.roles, { returnOnlyAllocationRoles: false })
      .map(role => roleLabelDictionary[role].label)
      .join(', '),
  }
}

export const allocationCell = (user: User): TableCell => {
  const allocations = [
    ...filterAllocationRoles(user.roles, { returnOnlyAllocationRoles: true }).map(
      role => allocationRoleLabelDictionary[role].label,
    ),
    ...user.qualifications.map(qualification => qualificationDictionary[qualification]),
  ].join(', ')

  return {
    text: allocations.length > 0 ? allocations : 'Standard',
  }
}

export const apAreaCell = (user: User): TableCell => {
  return {
    text: user.apArea.name,
  }
}
