import { Cas1ChangeRequestSummary } from '@approved-premises/api'
import { PaginatedRequestParams, SortedRequestParams } from '@approved-premises/ui'
import { stubFor } from './setup'
import paths from '../../server/paths/api'

export default {
  stubChangeRequestSummaries: (
    args: {
      changeRequests: Array<Cas1ChangeRequestSummary>
      cruManagementAreaId?: string
    } & Partial<PaginatedRequestParams> &
      Partial<SortedRequestParams>,
  ) => {
    const page = args.page || 1
    const perPage = args.perPage || 10
    const queryParameters: Record<string, Record<'equalTo', string | number>> = {
      page: args.page ? { equalTo: String(page) } : undefined,
      sortBy: args.sortBy ? { equalTo: args.sortBy } : undefined,
      sortDirection: args.sortDirection ? { equalTo: args.sortDirection } : undefined,
      cruManagementAreaId: args.cruManagementAreaId ? { equalTo: args.cruManagementAreaId } : undefined,
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.placementRequests.changeRequests({}),
        queryParameters,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Pagination-PageSize': String(perPage),
          'X-Pagination-TotalPages': String(Math.ceil(args.changeRequests.length / perPage)),
          'X-Pagination-TotalResults': String(args.changeRequests.length),
        },
        jsonBody: args.changeRequests.slice((page - 1) * perPage, page * perPage),
      },
    })
  },
}
