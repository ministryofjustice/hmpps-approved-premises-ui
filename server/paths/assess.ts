import { path } from 'static-path'

const assessmentsPath = path('/assessments')

const assessmentPath = assessmentsPath.path(':id')

const pagesPath = assessmentPath.path('tasks/:task/pages/:page')

const supportingInformationPath = assessmentPath.path('supporting-information/:category')

const submission = assessmentPath.path('submission')

const paths = {
  assessments: {
    index: assessmentsPath,
    show: assessmentPath,
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    supportingInformationPath,
    clarificationNotes: {
      confirm: assessmentPath.path('clarification-notes/confirmation'),
    },
    submission,
  },
}

export default paths
