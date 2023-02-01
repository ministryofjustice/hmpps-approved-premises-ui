import { path } from 'static-path'

const assessmentsPath = path('/assessments')

const assessmentPath = assessmentsPath.path(':id')

const pagesPath = assessmentPath.path('tasks/:task/pages/:page')

const submission = assessmentPath.path('submission')

const paths = {
  assessments: {
    index: assessmentsPath,
    show: assessmentPath,
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    clarificationNotes: {
      confirm: assessmentPath.path('clarification-notes/confirmation'),
    },
    submission,
  },
}

export default paths
