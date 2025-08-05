/* istanbul ignore file */

import departureReasonsJson from './cas1/departure-reasons.json'
import moveOnCategoriesJson from './cas1/move-on-categories.json'
import destinationProvidersJson from './destination-providers.json'
import cancellationReasonsJson from './cancellation-reasons.json'
import lostBedReasonsJson from './lost-bed-reasons.json'
import outOfServiceBedReasonsJson from './cas1/out-of-service-bed-reasons.json'
import keyWorkersJson from './keyworkers.json'
import probationRegionsJson from './probation-regions.json'
import paths from '../../../paths/api'

const departureReasons = {
  request: {
    method: 'GET',
    url: paths.cas1ReferenceData({ type: 'departure-reasons' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: departureReasonsJson,
  },
}

const moveOnCategories = {
  request: {
    method: 'GET',
    url: paths.cas1ReferenceData({ type: 'move-on-categories' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: moveOnCategoriesJson,
  },
}

const destinationProviders = {
  request: {
    method: 'GET',
    url: paths.referenceData({ type: 'destination-providers' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: destinationProvidersJson,
  },
}

const cancellationReasons = {
  request: {
    method: 'GET',
    url: paths.referenceData({ type: 'cancellation-reasons' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: cancellationReasonsJson,
  },
}

const lostBedReasons = {
  request: {
    method: 'GET',
    url: paths.referenceData({ type: 'lost-bed-reasons' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedReasonsJson,
  },
}

const outOfServiceBedReasons = {
  request: {
    method: 'GET',
    url: paths.cas1ReferenceData({ type: 'out-of-service-bed-reasons' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: outOfServiceBedReasonsJson,
  },
}

const keyWorkers = {
  request: {
    method: 'GET',
    url: paths.referenceData({ type: 'key-workers' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: keyWorkersJson,
  },
}

const probationRegions = {
  request: {
    method: 'GET',
    url: paths.referenceData({ type: 'probation-regions' }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: probationRegionsJson,
  },
}
export {
  departureReasons,
  moveOnCategories,
  destinationProviders,
  cancellationReasons,
  lostBedReasons,
  outOfServiceBedReasons,
  keyWorkers,
  probationRegions,
}
