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
  },
}
