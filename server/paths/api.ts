import { path } from 'static-path'

const premisesPath = path('/premises')
const singlePremisesPath = premisesPath.path(':premisesId')

const lostBedsPath = singlePremisesPath.path('lost-beds')

const bedsPath = singlePremisesPath.path('beds')

const bookingPath = singlePremisesPath.path('bookings/:bookingId')

const managePaths = {
  premises: {
    index: premisesPath.path('summary'),
    show: singlePremisesPath,
  },
  lostBeds: {
    create: lostBedsPath,
    index: lostBedsPath,
    show: lostBedsPath.path(':id'),
    update: lostBedsPath.path(':id'),
    cancel: lostBedsPath.path(':id/cancellations'),
  },
  beds: {
    index: bedsPath,
    show: bedsPath.path(':bedId'),
  },
  rooms: singlePremisesPath.path('rooms'),
  room: singlePremisesPath.path('rooms/:roomId'),
  bookings: {
    move: bookingPath.path('moves'),
    dateChange: bookingPath.path('date-changes'),
    bookingWithoutPremisesPath: path('/bookings/:bookingId'),
  },
}

const applicationsPath = path('/applications')
const singleApplicationPath = applicationsPath.path(':id')

const appealsPath = singleApplicationPath.path('appeals')

const peoplePath = path('/people')
const personPath = peoplePath.path(':crn')
const oasysPath = personPath.path('oasys')

const usersPath = path('/users')

const tasksPath = path('/tasks')
const taskPath = tasksPath.path(':taskType/:id')

const placementRequestsPath = path('/placement-requests')
const placementRequestPath = placementRequestsPath.path(':id')

const placementApplicationsPath = path('/placement-applications')
const placementApplicationPath = placementApplicationsPath.path(':id')

const reportsPath = path('/reports')

const tasksPaths = {
  index: tasksPath,
  show: taskPath,
  allocations: {
    create: taskPath.path('allocations'),
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
    summary: managePaths.premises.show.path('summary'),
    lostBeds: {
      create: managePaths.lostBeds.create,
      index: managePaths.lostBeds.index,
      update: managePaths.lostBeds.update,
      show: managePaths.lostBeds.show,
      cancel: managePaths.lostBeds.cancel,
    },
    staffMembers: {
      index: managePaths.premises.show.path('staff'),
    },
    beds: {
      index: managePaths.beds.index,
      show: managePaths.beds.show,
    },
    rooms: managePaths.rooms,
    room: managePaths.room,
    bookings: {
      move: managePaths.bookings.move,
      dateChange: managePaths.bookings.dateChange,
    },
    calendar: managePaths.premises.show.path('calendar'),
  },
  bookings: {
    bookingWithoutPremisesPath: managePaths.bookings.bookingWithoutPremisesPath,
  },
  applications: {
    show: applyPaths.applications.show,
    index: applyPaths.applications.index,
    all: applyPaths.applications.index.path('all'),
    update: applyPaths.applications.update,
    new: applyPaths.applications.create,
    submission: applyPaths.applications.submission,
    documents: applyPaths.applications.show.path('documents'),
    assessment: applyPaths.applications.show.path('assessment'),
    withdrawal: applyPaths.applications.show.path('withdrawal'),
    timeline: applyPaths.applications.show.path('timeline'),
    placementApplications: applyPaths.applications.show.path('placement-applications'),
    addNote: applyPaths.applications.show.path('notes'),
    withdrawables: applyPaths.applications.show.path('withdrawables'),
    appeals: {
      show: appealsPath.path(':appealId'),
      create: appealsPath,
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
    type: {
      index: tasksPaths.index.path(':taskType'),
    },
    show: tasksPaths.show,
    allocations: {
      create: tasksPaths.allocations.create,
    },
  },
  placementRequests: {
    index: placementRequestsPath,
    show: placementRequestPath,
    dashboard: placementRequestsPath.path('dashboard'),
    booking: placementRequestPath.path('booking'),
    bookingNotMade: placementRequestPath.path('booking-not-made'),
    withdrawal: {
      create: placementRequestPath.path('withdrawal'),
    },
  },
  placementApplications: {
    update: placementApplicationPath,
    create: placementApplicationsPath,
    show: placementApplicationPath,
    submit: placementApplicationPath.path('submission'),
    submitDecision: placementApplicationPath.path('decision'),
    withdraw: placementApplicationPath.path('withdraw'),
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
    search: usersPath.path('search'),
    searchDelius: usersPath.path('delius'),
    show: usersPath.path(':id'),
    profile: path('/profile'),
    update: usersPath.path(':id'),
    delete: usersPath.path(':id'),
  },
  reports: reportsPath.path(':reportName'),
}
