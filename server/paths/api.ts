import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const managePaths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
  },
  lostBeds: {
    create: lostBedsPath,
  },
  rooms: singlePremisesPath.path('rooms'),
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const usersPath = path('/users')

const tasksPath = path('/tasks')

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

const tasksPaths = {
  index: tasksPath,
  allocations: {
    create: tasksPath.path('/:applicationId/allocations'),
  },
}

const applyPaths = {
  applications: {
    show: singleApplicationPath,
    create: applicationsPath,
    index: applicationsPath,
    update: singleApplicationPath,
    submission: singleApplicationPath.path('submission'),
  },
}

const taskPaths = {
  tasks: {
    show: singleApplicationPath.path('tasks/:taskType'),
  },
}

const assessPaths = {
  assessments: path('/assessments'),
  singleAssessment: path('/assessments/:id'),
  acceptance: path('/assessments/:id/acceptance'),
  rejection: path('/assessments/:id/rejection'),
}

const clarificationNotePaths = {
  notes: assessPaths.singleAssessment.path('notes'),
}

export default {
  premises: {
    show: managePaths.premises.show,
    index: managePaths.premises.index,
    capacity: managePaths.premises.show.path('capacity'),
    lostBeds: {
      create: managePaths.lostBeds.create,
    },
    staffMembers: {
      index: managePaths.premises.show.path('staff'),
    },
    rooms: managePaths.rooms,
  },
  applications: {
    show: applyPaths.applications.show,
    index: applyPaths.applications.index,
    update: applyPaths.applications.update,
    new: applyPaths.applications.create,
    submission: applyPaths.applications.submission,
    documents: applyPaths.applications.show.path('documents'),
    assessment: applyPaths.applications.show.path('assessment'),
    tasks: {
      show: taskPaths.tasks.show,
      allocations: {
        create: taskPaths.tasks.show.path('allocations'),
      },
    },
  },
  assessments: {
    index: assessPaths.assessments,
    show: assessPaths.singleAssessment,
    update: assessPaths.singleAssessment,
    acceptance: assessPaths.acceptance,
    rejection: assessPaths.rejection,
    clarificationNotes: {
      create: clarificationNotePaths.notes,
      update: clarificationNotePaths.notes.path(':clarificationNoteId'),
    },
  },
  match: {
    findBeds: path('/beds/search'),
  },
  tasks: {
    index: tasksPaths.index,
  },
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    booking: placementRequestPath.path('booking'),
  },
  people: {
    risks: {
      show: personPath.path('risks'),
    },
    search: peoplePath.path('search'),
    prisonCaseNotes: personPath.path('prison-case-notes'),
    adjudications: personPath.path('adjudications'),
    acctAlerts: personPath.path('acct-alerts'),
    offences: personPath.path('offences'),
    documents: path('/documents/:crn/:documentId'),
    oasys: {
      selection: oasysPath.path('selection'),
      sections: oasysPath.path('sections'),
    },
  },
  users: {
    index: usersPath,
    show: usersPath.path(':id'),
    profile: path('/profile'),
  },
}
