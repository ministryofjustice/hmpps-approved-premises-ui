import { path } from 'static-path'

// CAS1 namespaced
const cas1Namespace = path('/cas1')

const cas1Premises = cas1Namespace.path('premises')
const cas1PremisesSingle = cas1Premises.path(':premisesId')
const cas1LostBeds = cas1PremisesSingle.path('lost-beds')
const cas1LostBedsSingle = cas1LostBeds.path(':id')
const cas1LostBedsCancellations = cas1LostBedsSingle.path('cancellations')
const cas1OutOfServiceBeds = cas1PremisesSingle.path('out-of-service-beds')
const cas1OutOfServiceBedsSingle = cas1OutOfServiceBeds.path(':id')
const cas1SpaceBookingSingle = cas1PremisesSingle.path('space-bookings/:placementId')

const cas1SpaceBookings = cas1Namespace.path('/placement-requests/:id/space-bookings')

const cas1Reports = cas1Namespace.path('reports')

// Non-namespaced
const premises = path('/premises')
const premisesSingle = premises.path(':premisesId')
const beds = premisesSingle.path('beds')
const rooms = premisesSingle.path('rooms')
const booking = premisesSingle.path('bookings/:bookingId')

const profile = path('/profile')

const applications = path('/applications')
const applicationsSingle = applications.path(':id')
const appeals = applicationsSingle.path('appeals')

const people = path('/people')
const person = people.path(':crn')
const oasys = person.path('oasys')

const users = path('/users')
const cas1Users = cas1Namespace.path('users')

const tasks = path('/tasks')
const taskSingle = tasks.path(':taskType/:id')

const placementRequests = path('/placement-requests')
const placementRequestsSingle = placementRequests.path(':id')

const placementApplications = path('/placement-applications')
const placementApplicationsSingle = placementApplications.path(':id')

const assessments = path('/assessments')
const assessmentsSingle = assessments.path(':id')
const assessmentsNotes = assessmentsSingle.path('notes')

export default {
  manage: {
    premises: {
      outOfServiceBeds: {
        create: cas1OutOfServiceBeds,
        premisesIndex: cas1OutOfServiceBeds,
        update: cas1OutOfServiceBedsSingle,
        show: cas1OutOfServiceBedsSingle,
        cancel: cas1OutOfServiceBedsSingle.path('cancellations'),
      },
    },
    outOfServiceBeds: {
      index: cas1Namespace.path('out-of-service-beds'),
    },
  },
  premises: {
    show: cas1PremisesSingle,
    index: premises.path('summary'),
    indexCas1: cas1Premises.path('summary'),
    capacity: premisesSingle.path('capacity'),
    summary: premisesSingle.path('summary'),
    lostBeds: {
      create: cas1LostBeds,
      index: cas1LostBeds,
      update: cas1LostBedsSingle,
      show: cas1LostBedsSingle,
      cancel: cas1LostBedsCancellations,
    },
    staffMembers: {
      index: premisesSingle.path('staff'),
    },
    beds: {
      index: beds,
      show: beds.path(':bedId'),
    },
    rooms,
    room: rooms.path(':roomId'),
    bookings: {
      move: booking.path('moves'),
      dateChange: booking.path('date-changes'),
    },
    placements: {
      index: cas1PremisesSingle.path('space-bookings'),
      show: cas1SpaceBookingSingle,
      arrival: cas1SpaceBookingSingle.path('arrival'),
      nonArrival: cas1SpaceBookingSingle.path('non-arrival'),
      keyworker: cas1SpaceBookingSingle.path('keyworker'),
    },
    calendar: premisesSingle.path('calendar'),
  },
  bookings: {
    bookingWithoutPremisesPath: path('/bookings/:bookingId'),
  },
  applications: {
    show: applicationsSingle,
    index: applications,
    all: applications.path('all'),
    update: applicationsSingle,
    new: applications,
    submission: applicationsSingle.path('submission'),
    documents: applicationsSingle.path('documents'),
    assessment: applicationsSingle.path('assessment'),
    withdrawal: applicationsSingle.path('withdrawal'),
    timeline: applicationsSingle.path('timeline'),
    placementApplications: applicationsSingle.path('placement-applications'),
    requestsForPlacement: applicationsSingle.path('requests-for-placement'),
    addNote: applicationsSingle.path('notes'),
    withdrawables: applicationsSingle.path('withdrawables'),
    withdrawablesWithNotes: applicationsSingle.path('withdrawablesWithNotes'),
    appeals: {
      show: appeals.path(':appealId'),
      create: appeals,
    },
  },
  assessments: {
    index: assessments,
    show: assessmentsSingle,
    update: assessmentsSingle,
    acceptance: assessmentsSingle.path('acceptance'),
    rejection: assessmentsSingle.path('rejection'),
    clarificationNotes: {
      create: assessmentsNotes,
      update: assessmentsNotes.path(':clarificationNoteId'),
    },
  },
  match: {
    findSpaces: cas1Namespace.path('spaces/search'),
  },
  tasks: {
    index: tasks,
    type: {
      index: tasks.path(':taskType'),
    },
    show: taskSingle,
    allocations: {
      create: taskSingle.path('allocations'),
    },
  },
  placementRequests: {
    index: placementRequests,
    show: placementRequestsSingle,
    dashboard: placementRequests.path('dashboard'),
    booking: placementRequestsSingle.path('booking'),
    bookingNotMade: placementRequestsSingle.path('booking-not-made'),
    withdrawal: {
      create: placementRequestsSingle.path('withdrawal'),
    },
    spaceBookings: {
      create: cas1SpaceBookings,
    },
  },
  placementApplications: {
    update: placementApplicationsSingle,
    create: placementApplications,
    show: placementApplicationsSingle,
    submit: placementApplicationsSingle.path('submission'),
    submitDecision: placementApplicationsSingle.path('decision'),
    withdraw: placementApplicationsSingle.path('withdraw'),
  },
  people: {
    risks: {
      show: person.path('risks'),
    },
    search: people.path('search'),
    prisonCaseNotes: person.path('prison-case-notes'),
    adjudications: person.path('adjudications'),
    acctAlerts: person.path('acct-alerts'),
    offences: person.path('offences'),
    documents: path('/documents/:crn/:documentId'),
    oasys: {
      selection: oasys.path('selection'),
      sections: oasys.path('sections'),
    },
    timeline: person.path('timeline'),
  },
  users: {
    index: users,
    summary: users.path('summary'),
    search: users.path('search'),
    searchDelius: users.path('delius'),
    show: cas1Users.path(':id'),
    update: cas1Users.path(':id'),
    delete: cas1Users.path(':id'),
    profile: profile.path('v2'),
  },
  reports: cas1Reports.path(':reportName'),
}
