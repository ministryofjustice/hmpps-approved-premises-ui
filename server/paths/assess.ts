import { path } from 'static-path'
import applyPaths from './apply'

const assessmentsPath = path('/assessments')

const assessmentPath = assessmentsPath.path(':id')

const pagesPath = assessmentPath.path('tasks/:task/pages/:page')

const supportingInformationPath = assessmentPath.path('supporting-information/:category')

const submission = assessmentPath.path('submission')

const allocationPath = applyPaths.applications.show.path('allocation')

const paths = {
  assessments: {
    index: assessmentsPath,
    show: assessmentPath,
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    supportingInformationPath,
    submission,
  },
  allocations: {
    show: allocationPath,
    create: allocationPath,
  },
}

export default paths
