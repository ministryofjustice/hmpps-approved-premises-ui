import { path } from 'static-path'

const placementRequestsPath = path('/placement-requests')
const bedsPath = path('/beds')

export default {
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestsPath.path(':id'),
  },
  beds: {
    search: bedsPath.path('search'),
  },
}
