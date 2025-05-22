import { path } from 'static-path'

// CAS1 namespaced
const cas1Namespace = path('/cas1')

const cas1Premises = cas1Namespace.path('premises')
const cas1PremisesSingle = cas1Premises.path(':premisesId')
const cas1Beds = cas1PremisesSingle.path('beds')
const cas1LostBeds = cas1PremisesSingle.path('lost-beds')
const cas1LostBedsSingle = cas1LostBeds.path(':id')
const cas1LostBedsCancellations = cas1LostBedsSingle.path('cancellations')
const cas1OutOfServiceBeds = cas1PremisesSingle.path('out-of-service-beds')
const cas1OutOfServiceBedsSingle = cas1OutOfServiceBeds.path(':id')
const cas1SpaceBookingSingle = cas1PremisesSingle.path('space-bookings/:placementId')
const cas1Capacity = cas1PremisesSingle.path('capacity')
const cas1DaySummary = cas1PremisesSingle.path('day-summary/:date')

const cas1PlacementRequestSingle = cas1Namespace.path('placement-requests/:id')
const cas1SpaceBookings = cas1PlacementRequestSingle.path('space-bookings')

const cas1Reports = cas1Namespace.path('reports')

const cas1People = cas1Namespace.path('people')
const cas1Person = cas1People.path(':crn')

const cas1Applications = cas1Namespace.path('applications')
const cas1ApplicationsSingle = cas1Applications.path(':id')

const cas1PlacementRequests = cas1Namespace.path('placement-requests')

// Non-namespaced
const premises = path('/premises')
const premisesSingle = premises.path(':premisesId')
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
    index: cas1Premises.path('summary'),
    capacity: cas1Capacity,
    daySummary: cas1DaySummary,
    summary: premisesSingle.path('summary'),
    lostBeds: {
      create: cas1LostBeds,
      index: cas1LostBeds,
      update: cas1LostBedsSingle,
      show: cas1LostBedsSingle,
      cancel: cas1LostBedsCancellations,
    },
    staffMembers: {
      index: cas1PremisesSingle.path('staff'),
    },
    beds: {
      index: cas1Beds,
      show: cas1Beds.path(':bedId'),
    },
    rooms,
    room: rooms.path(':roomId'),
    bookings: {
      move: booking.path('moves'),
      dateChange: booking.path('date-changes'),
    },
    placements: {
      show: cas1SpaceBookingSingle,
      index: cas1PremisesSingle.path('space-bookings'),
      arrival: cas1SpaceBookingSingle.path('arrival'),
      nonArrival: cas1SpaceBookingSingle.path('non-arrival'),
      keyworker: cas1SpaceBookingSingle.path('keyworker'),
      departure: cas1SpaceBookingSingle.path('departure'),
      cancel: cas1SpaceBookingSingle.path('cancellations'),
      timeline: cas1SpaceBookingSingle.path('timeline'),
      emergencyTransfer: cas1SpaceBookingSingle.path('emergency-transfer'),
    },
    calendar: premisesSingle.path('calendar'),
    occupancyReport: cas1Premises.path('occupancy-report'),
  },
  bookings: {
    bookingWithoutPremisesPath: path('/bookings/:bookingId'),
  },
  placements: {
    placementWithoutPremises: cas1Namespace.path('space-bookings/:placementId'),
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
    timeline: cas1ApplicationsSingle.path('timeline'),
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
    show: placementRequestsSingle,
    dashboard: placementRequests.path('dashboard'),
    changeRequests: cas1PlacementRequests.path('change-requests'),
    booking: placementRequestsSingle.path('booking'),
    bookingNotMade: placementRequestsSingle.path('booking-not-made'),
    withdrawal: {
      create: placementRequestsSingle.path('withdrawal'),
    },
    spaceBookings: {
      create: cas1SpaceBookings,
    },
    appeal: cas1PlacementRequestSingle.path('appeal'),
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
    timeline: cas1Person.path('timeline'),
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
