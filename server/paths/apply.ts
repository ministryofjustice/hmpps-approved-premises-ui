import { path } from 'static-path'

const applicationsPath = path('/applications')
const applicationPath = applicationsPath.path(':id')

const pagesPath = applicationPath.path('tasks/:task/pages/:page')
const peoplePath = applicationsPath.path('people')
const personPath = peoplePath.path(':crn')
const withdrawalsPath = applicationPath.path('withdrawals')

const paths = {
  applications: {
    new: applicationsPath.path('new'),
    start: applicationsPath.path('start'),
    dashboard: applicationsPath.path('dashboard'),
    people: {
      find: peoplePath.path('find'),
      selectOffence: personPath.path('select-offence'),
      documents: personPath.path('documents/:documentId'),
    },
    create: applicationsPath,
    index: applicationsPath,
    show: applicationPath,
    update: applicationPath,
    checkYourAnswers: applicationPath.path('check-your-answers'),
    submission: applicationPath.path('submission'),
    withdraw: {
      new: withdrawalsPath.path('new'),
      create: withdrawalsPath,
    },
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
  },
}

export default paths
