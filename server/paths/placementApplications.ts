import { path } from 'static-path'

const placementApplicationsPath = path('/placement-applications')
const placementApplicationPath = placementApplicationsPath.path(':id')
const pagesPath = placementApplicationPath.path('tasks/:task/pages/:page')

export default {
  placementApplications: {
    create: placementApplicationsPath,
    show: placementApplicationPath,
    confirm: placementApplicationsPath.path('confirm'),
    submit: placementApplicationPath.path('submit'),
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    review: {
      show: placementApplicationPath.path('review'),
      update: placementApplicationPath.path('update'),
      decision: placementApplicationPath.path('decision'),
      submission: placementApplicationPath.path('submission'),
      confirm: placementApplicationPath.path('confirm'),
    },
    withdraw: {
      new: placementApplicationPath.path('withdrawals/new'),
      create: placementApplicationPath.path('withdrawals/create'),
    },
  },
}
