import { path } from 'static-path'

const assessmentsPath = path('/assessments')

const assessmentPath = assessmentsPath.path(':id')

const pagesPath = assessmentPath.path('tasks/:task/pages/:page')
const clarificationNotesPath = assessmentPath.path('/clarification-notes')

const paths = {
  assessments: {
    index: assessmentsPath,
    show: assessmentPath,
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    clarificationNotes: {
      create: clarificationNotesPath,
      confirm: assessmentPath.path('/confirmation'),
    },
  },
}

export default paths
