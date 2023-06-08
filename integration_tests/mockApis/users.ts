import {
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import { stubFor } from '../../wiremock'
import paths from '../../server/paths/api'

const stubFindUser = (args: { user: User; id: string }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: paths.users.show({ id: args.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.user,
    },
  })

const stubUsers = (args: {
  users: Array<User>
  roles?: Array<UserRole>
  qualifications?: Array<UserQualification>
}) => {
  let url = paths.users.index({})
  const queries = []

  if (args.roles) {
    queries.push(`roles=${args.roles.join(',')}`)
  }

  if (args.qualifications) {
    queries.push(`qualifications=${args.qualifications.join(',')}`)
  }

  if (args.roles || args.qualifications) {
    url += `?${queries.join('&')}`
  }

  return stubFor({
    request: {
      method: 'GET',
      url,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.users,
    },
  })
}

export default { stubFindUser, stubUsers }
