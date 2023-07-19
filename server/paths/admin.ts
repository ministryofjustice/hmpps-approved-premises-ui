import { path } from 'static-path'

const adminPath = path('/admin')
const placementRequestsPath = adminPath.path('placement-requests')

export default {
  admin: {
    placementRequests: {
      index: placementRequestsPath,
      show: placementRequestsPath.path(':id'),
    },
  },
}
