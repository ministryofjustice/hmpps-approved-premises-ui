import { path } from 'static-path'

// CAS1 namespaced
const cas1Namespace = path('/cas1')

const cas1Premises = cas1Namespace.path('premises')
const cas1PremisesSingle = cas1Premises.path(':premisesId')
const cas1Beds = cas1PremisesSingle.path('beds')
const cas1OutOfServiceBeds = cas1PremisesSingle.path('out-of-service-beds')
const cas1OutOfServiceBedsSingle = cas1OutOfServiceBeds.path(':id')
const cas1LocalRestrictions = cas1PremisesSingle.path('local-restrictions')
const cas1SpaceBookingSingle = cas1PremisesSingle.path('space-bookings/:placementId')
const cas1Capacity = cas1PremisesSingle.path('capacity')
const cas1NationalCapacity = cas1Premises.path('capacity')
const cas1DaySummary = cas1PremisesSingle.path('day-summary/:date')
const cas1PlacementApplications = cas1Namespace.path('placement-applications')
const cas1PlacementApplicationsSingle = cas1PlacementApplications.path(':id')
const cas1PlacementRequests = cas1Namespace.path('placement-requests')
const cas1PlacementRequestSingle = cas1PlacementRequests.path(':placementRequestId')
const cas1SpaceBookings = cas1PlacementRequestSingle.path('space-bookings')
const cas1Tasks = cas1Namespace.path('tasks')
const cas1TasksSingle = cas1Tasks.path(':taskType/:id')

const cas1Reports = cas1Namespace.path('reports')

const cas1People = cas1Namespace.path('people')
const cas1Person = cas1People.path(':crn')
const cas1Oasys = cas1Person.path('oasys')

const cas1Applications = cas1Namespace.path('applications')
const cas1ApplicationsSingle = cas1Applications.path(':id')
const cas1Appeals = cas1ApplicationsSingle.path('appeals')

const cas1Assessments = cas1Namespace.path('assessments')
const cas1AssessmentsSingle = cas1Assessments.path(':id')
const cas1AssessmentsNotes = cas1AssessmentsSingle.path('notes')

const cas1ReferenceData = cas1Namespace.path('reference-data')

const cas1Profile = cas1Namespace.path('/profile')

// Non-namespaced
const people = path('/people')
const person = people.path(':crn')

const cas1Users = cas1Namespace.path('users')

const placementRequests = path('/placement-requests')
const placementRequestsSingle = placementRequests.path(':placementRequestId')

const referenceData = path('/reference-data')

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
    nationalCapacity: cas1NationalCapacity,
    daySummary: cas1DaySummary,
    beds: {
      index: cas1Beds,
      show: cas1Beds.path(':bedId'),
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
      appeal: cas1SpaceBookingSingle.path('appeal'),
    },
    occupancyReport: cas1Premises.path('occupancy-report'),
    localRestrictions: {
      create: cas1LocalRestrictions,
      delete: cas1LocalRestrictions.path(':restrictionId'),
    },
    currentKeyworkers: cas1PremisesSingle.path('current-key-workers'),
  },
  placements: {
    placementWithoutPremises: cas1Namespace.path('space-bookings/:placementId'),
  },
  applications: {
    show: cas1ApplicationsSingle,
    me: cas1Applications.path('me'),
    all: cas1Applications.path('all'),
    update: cas1ApplicationsSingle,
    new: cas1Applications,
    submission: cas1ApplicationsSingle.path('submission'),
    documents: cas1ApplicationsSingle.path('documents'),
    withdrawal: cas1ApplicationsSingle.path('withdrawal'),
    expire: cas1ApplicationsSingle.path('expire'),
    timeline: cas1ApplicationsSingle.path('timeline'),
    requestsForPlacement: cas1ApplicationsSingle.path('requests-for-placement'),
    addNote: cas1ApplicationsSingle.path('notes'),
    withdrawablesWithNotes: cas1ApplicationsSingle.path('withdrawablesWithNotes'),
    appeals: {
      show: cas1Appeals.path(':appealId'),
      create: cas1Appeals,
    },
  },
  assessments: {
    index: cas1Assessments,
    show: cas1AssessmentsSingle,
    update: cas1AssessmentsSingle,
    acceptance: cas1AssessmentsSingle.path('acceptance'),
    rejection: cas1AssessmentsSingle.path('rejection'),
    clarificationNotes: {
      create: cas1AssessmentsNotes,
      update: cas1AssessmentsNotes.path(':clarificationNoteId'),
    },
  },
  match: {
    findSpaces: cas1Namespace.path('spaces/search'),
  },
  tasks: {
    index: cas1Tasks,
    show: cas1TasksSingle,
    allocations: {
      create: cas1TasksSingle.path('allocations'),
    },
  },
  placementRequests: {
    show: cas1PlacementRequestSingle,
    dashboard: cas1PlacementRequests,
    changeRequests: cas1PlacementRequests.path('change-requests'),
    booking: placementRequestsSingle.path('booking'),
    bookingNotMade: placementRequestsSingle.path('booking-not-made'),
    withdrawal: {
      create: cas1PlacementRequestSingle.path('withdrawal'),
    },
    spaceBookings: {
      create: cas1SpaceBookings,
    },
    appeal: cas1PlacementRequestSingle.path('appeal'),
    plannedTransfer: cas1PlacementRequestSingle.path('planned-transfer'),
    extension: cas1PlacementRequestSingle.path('extension'),
    changeRequest: cas1PlacementRequestSingle.path('change-requests/:changeRequestId'),
  },
  placementApplications: {
    update: cas1PlacementApplicationsSingle,
    create: cas1PlacementApplications,
    show: cas1PlacementApplicationsSingle,
    submit: cas1PlacementApplicationsSingle.path('submission'),
    submitDecision: cas1PlacementApplicationsSingle.path('decision'),
    withdraw: cas1PlacementApplicationsSingle.path('withdraw'),
  },
  people: {
    search: people.path('search'),
    prisonCaseNotes: person.path('prison-case-notes'),
    adjudications: person.path('adjudications'),
    acctAlerts: person.path('acct-alerts'),
    offences: person.path('offences'),
    documents: cas1Namespace.path('/documents/:crn/:documentId'),
    oasys: {
      metadata: cas1Oasys.path('metadata'),
      answers: cas1Oasys.path('answers'),
    },
    timeline: cas1Person.path('timeline'),
    riskProfile: cas1Person.path('risk-profile'),
  },
  users: {
    index: cas1Users,
    summary: cas1Users.path('summary'),
    search: cas1Users.path('search'),
    searchDelius: cas1Users.path('delius'),
    show: cas1Users.path(':id'),
    update: cas1Users.path(':id'),
    delete: cas1Users.path(':id'),
    profile: cas1Profile,
  },
  reports: cas1Reports.path(':reportName'),
  cas1ReferenceData: cas1ReferenceData.path(':type'),
  referenceData: referenceData.path(':type'),
}
