import { SortDirection, ApprovedPremisesUser as User } from '../../@types/shared'
import { TableCell } from '../../@types/ui'
import paths from '../../paths/admin'
import { sortHeader } from '../sortHeader'
import { emailCell } from '../tableUtils'
import { linkTo, sentenceCase } from '../utils'

export const managementDashboardTableHeader = (
  sortBy: string = undefined,
  sortDirection: SortDirection | undefined = undefined,
  hrefPrefix: string | undefined = undefined,
): Array<TableCell> => {
  return [
    hrefPrefix === undefined
      ? {
          text: 'Name',
        }
      : sortHeader('Name', 'name', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Role',
    },
    {
      text: 'Email',
    },
    { text: 'Region' },
  ]
}

export const managementDashboardTableRows = (users: Array<User>): Array<Array<TableCell>> => {
  return users.map(user => [nameCell(user), roleCell(user), emailCell(user), regionCell(user)])
}

const nameCell = (user: User): TableCell => {
  return {
    html: linkTo(paths.admin.userManagement.edit, { id: user.id }, { text: user.name }),
  }
}

const roleCell = (user: User): TableCell => {
  return {
    text: user.roles.map(role => sentenceCase(role)).join(', '),
  }
}

const regionCell = (user: User): TableCell => {
  return {
    text: user.region.name,
  }
}
