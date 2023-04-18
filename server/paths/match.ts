import { path } from 'static-path'

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

export default {
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    beds: {
      search: placementRequestPath.path('beds/search'),
    },
  },
}
