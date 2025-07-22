import { path } from 'static-path'

// V1 Manage paths
const v1PremisesPath = path('/premises')
const v1SinglePremisesPath = v1PremisesPath.path(':premisesId')

const v1BookingsPath = v1SinglePremisesPath.path('bookings')

const v1PeoplePath = v1BookingsPath.path('people')

const v1LostBedsPath = v1SinglePremisesPath.path('beds/:bedId/lost-beds')

const v1BedsPath = v1SinglePremisesPath.path('beds')

const deprecated = {
  premises: {
    index: v1PremisesPath,
    show: v1SinglePremisesPath,
    beds: {
      index: v1BedsPath,
      show: v1BedsPath.path(':bedId'),
    },
  },
  bookings: {
    // This path may still present in old confirmation emails and therefore must be redirected. The original path
    // used `:bookingId` as a parameter name, this has been changed to `:placementId` to allow for a straight redirect
    // to the new Space Booking path.
    show: v1BookingsPath.path(':placementId'),
  },
  lostBeds: {
    new: v1LostBedsPath.path('new'),
    create: v1LostBedsPath,
    index: v1SinglePremisesPath.path('lost-beds'),
    show: v1LostBedsPath.path(':id'),
    update: v1SinglePremisesPath.path('lost-beds').path(':id'),
  },
}

// Manage paths
const managePath = path('/manage')
const premisesPath = managePath.path('premises')
const singlePremisesPath = premisesPath.path(':premisesId')
const singlePlacementPath = singlePremisesPath.path('placements/:placementId')
const departurePath = singlePlacementPath.path('departure')
const placementCancellationsPath = singlePlacementPath.path('cancellations')
const placementChangesPath = singlePlacementPath.path('changes')
const placementTransfersPath = singlePlacementPath.path('transfers')
const placementAppealPath = singlePlacementPath.path('appeal')
const bookingsPath = singlePremisesPath.path('bookings')
const bedsPath = singlePremisesPath.path('beds')
const outOfServiceBedsPath = singlePremisesPath.path('beds/:bedId/out-of-service-beds')
const outOfServiceBedPath = outOfServiceBedsPath.path(':id')
const outOfServiceBedsIndexPath = managePath.path('out-of-service-beds')

const paths = {
  premises: {
    index: premisesPath,
    show: singlePremisesPath,
    beds: {
      index: bedsPath,
      show: bedsPath.path(':bedId'),
    },
    placements: {
      show: singlePlacementPath,
      showTabApplication: singlePlacementPath.path('application'),
      showTabAssessment: singlePlacementPath.path('assessment'),
      showTabPlacementRequest: singlePlacementPath.path('placement-request'),
      showTabTimeline: singlePlacementPath.path('timeline'),
      arrival: singlePlacementPath.path('arrival'),
      keyworker: singlePlacementPath.path('keyworker'),
      nonArrival: singlePlacementPath.path('non-arrival'),
      departure: {
        new: departurePath.path('new'),
        breachOrRecallReason: departurePath.path('breach-or-recall'),
        moveOnCategory: departurePath.path('move-on'),
        notes: departurePath.path('notes'),
      },
      cancellations: {
        new: placementCancellationsPath.path('new'),
        create: placementCancellationsPath.path('create'),
      },
      changes: {
        new: placementChangesPath.path('new'),
        confirm: placementChangesPath.path('confirm'),
      },
      transfers: {
        new: placementTransfersPath.path('new'),
        emergencyDetails: placementTransfersPath.path('emergency'),
        plannedDetails: placementTransfersPath.path('planned'),
        emergencyConfirm: placementTransfersPath.path('confirm-emergency'),
        plannedConfirm: placementTransfersPath.path('confirm-planned'),
      },
      appeal: {
        new: placementAppealPath.path('new'),
        confirm: placementAppealPath.path('confirm'),
      },
    },
    occupancy: {
      view: singlePremisesPath.path('occupancy'),
      day: singlePremisesPath.path('occupancy/day/:date'),
    },
  },

  bookings: {
    // In effect deprecated: legacy bookings have been migrated to space bookings. A redirect is now in place.
    show: bookingsPath.path(':placementId'),
  },
  people: {
    find: v1PeoplePath, // no v2 equivalent
  },
  outOfServiceBeds: {
    new: outOfServiceBedsPath.path('new'),
    create: outOfServiceBedsPath,
    premisesIndex: singlePremisesPath.path('out-of-service-beds').path(':temporality'),
    index: outOfServiceBedsIndexPath.path(':temporality'),
    show: outOfServiceBedPath.path(':tab'),
    update: outOfServiceBedPath.path('update'),
    cancel: outOfServiceBedPath.path('cancel'),
  },
}

export default { deprecated, ...paths }
