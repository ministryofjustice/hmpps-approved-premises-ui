import { path } from 'static-path'

const applicationsPath = path('/applications')
const applicationPath = applicationsPath.path(':id')

const pagesPath = applicationPath.path('tasks/:task/pages/:page')
const peoplePath = applicationsPath.path('people')
const personPath = peoplePath.path(':crn')
const withdrawalsPath = applicationPath.path('withdrawals')
const withdrawablesPath = applicationPath.path('withdrawables')
const appealsPath = applicationPath.path('appeals')

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
    withdrawables: {
      show: withdrawablesPath.path('show'),
      create: withdrawablesPath.path('create'),
    },
    withdraw: {
      new: withdrawalsPath.path('new'),
      create: withdrawalsPath,
    },
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
    notes: {
      new: applicationPath.path('notes/new'),
      create: applicationPath.path('notes/create'),
    },
    appeals: {
      create: appealsPath,
      new: appealsPath.path('new'),
    },
  },
}

export default paths
