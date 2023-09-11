import {
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import QueryString from 'qs'
import { getMatchingRequests, stubFor } from '../../wiremock'
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

const stubUserUpdate = (args: { user: User }) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: paths.users.update({ id: args.user.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.user,
    },
  })

const stubUserSearch = (args: { results: Array<User>; searchTerm: string }) =>
  stubFor({
    request: {
      method: 'GET',
      url: `${paths.users.search({})}?${QueryString.stringify({ name: args.searchTerm })}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.results,
    },
  })

const stubDeliusUserSearch = (args: { result: User; searchTerm: string }) =>
  stubFor({
    request: {
      method: 'GET',
      url: `${paths.users.searchDelius({})}?${QueryString.stringify({ name: args.searchTerm })}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.result,
    },
  })

const stubNotFoundDeliusUserSearch = (args: { searchTerm: string }) =>
  stubFor({
    request: {
      method: 'GET',
      url: `${paths.users.searchDelius({})}?${QueryString.stringify({ name: args.searchTerm })}`,
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubUserDelete = (args: { id: string }) =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: paths.users.delete({ id: args.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const verifyUserUpdate = async (userId: string) =>
  (
    await getMatchingRequests({
      method: 'PUT',
      urlPathPattern: paths.users.update({ id: userId }),
    })
  ).body.requests

export default {
  stubFindUser,
  stubUsers,
  stubUserUpdate,
  stubUserSearch,
  stubUserDelete,
  stubDeliusUserSearch,
  stubNotFoundDeliusUserSearch,
  verifyUserUpdate,
}
