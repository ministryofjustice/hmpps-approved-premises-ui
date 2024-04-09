import {
  ApArea,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import QueryString from 'qs'
import { Response } from 'superagent'
import { getMatchingRequests, stubFor } from './setup'
import paths from '../../server/paths/api'
import { probationRegions } from '../../server/testutils/referenceData/stubs/referenceDataStubs'
import { apAreaFactory } from '../../server/testutils/factories'

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

const stubUserList = (args: { users: Array<User>; roles: Array<UserRole> }) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.users.index.pattern,
      queryParameters: {
        roles: { equalTo: args.roles.join(',') },
      },
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

const stubUsers = (args: {
  users: Array<User>
  roles?: Array<UserRole>
  qualifications?: Array<UserQualification>
  apAreaId: string
  page: string
  sortBy: string
  sortDirection: string
}) => {
  const queryParameters = {
    page: {
      equalTo: args.page || '1',
    },
    sortBy: {
      equalTo: args.sortBy || 'name',
    },
    sortDirection: {
      equalTo: args.sortDirection || 'asc',
    },
  } as Record<string, unknown>

  if (args.roles) {
    queryParameters.roles = {
      equalTo: args.roles.join(','),
    }
  }

  if (args.qualifications) {
    queryParameters.qualifications = {
      equalTo: args.qualifications.join(','),
    }
  }

  if (args.apAreaId) {
    queryParameters.apAreaId = {
      equalTo: args.apAreaId,
    }
  }

  return stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.users.index.pattern,
      queryParameters,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Pagination-TotalPages': '10',
        'X-Pagination-TotalResults': '100',
        'X-Pagination-PageSize': '10',
      },
      jsonBody: args.users,
    },
  })
}

const verifyUsersRequest = async ({
  page = '1',
  sortBy = 'name',
  sortDirection = 'asc',
}: {
  page: string
  sortBy: string
  sortDirection: string
}) =>
  (
    await getMatchingRequests({
      method: 'GET',
      urlPathPattern: paths.users.index.pattern,
      queryParameters: {
        page: {
          equalTo: page,
        },
        sortBy: {
          equalTo: sortBy,
        },
        sortDirection: {
          equalTo: sortDirection,
        },
      },
    })
  ).body.requests

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

const stubProbationRegionsReferenceData = (): Promise<Response> => stubFor(probationRegions)

const stubApAreaReferenceData = (
  {
    apArea = null,
    additionalAreas = [],
  }: {
    apArea: ApArea | null
    additionalAreas: Array<ApArea>
  } = { apArea: null, additionalAreas: [] },
): Promise<Response> => {
  const apAreas = [...additionalAreas.map(area => apAreaFactory.build(area)), ...apAreaFactory.buildList(10)]

  if (apArea != null) {
    apAreas.push(apAreaFactory.build(apArea))
  }

  return stubFor({
    request: {
      method: 'GET',
      url: '/reference-data/ap-areas',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: apAreas,
    },
  })
}

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
  stubUserList,
  stubUserUpdate,
  stubUserSearch,
  stubUserDelete,
  stubDeliusUserSearch,
  stubNotFoundDeliusUserSearch,
  verifyUserUpdate,
  verifyUsersRequest,
  stubProbationRegionsReferenceData,
  stubApAreaReferenceData,
}
