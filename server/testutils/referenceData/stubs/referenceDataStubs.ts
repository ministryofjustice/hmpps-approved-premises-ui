/* istanbul ignore file */

import departureReasonsJson from './departure-reasons.json'
import moveOnCategoriesJson from './move-on-categories.json'
import destinationProvidersJson from './destination-providers.json'
import cancellationReasonsJson from './cancellation-reasons.json'
import lostBedReasonsJson from './lost-bed-reasons.json'
import keyWorkersJson from './keyworkers.json'
import probationRegionsJson from './probation-regions.json'

const departureReasons = {
  request: {
    method: 'GET',
    url: '/reference-data/departure-reasons',
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
    url: '/reference-data/move-on-categories',
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
    url: '/reference-data/destination-providers',
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
    url: '/reference-data/cancellation-reasons',
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
    url: '/reference-data/lost-bed-reasons',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedReasonsJson,
  },
}

const keyWorkers = {
  request: {
    method: 'GET',
    url: '/reference-data/key-workers',
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
    url: '/reference-data/probation-regions',
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
  keyWorkers,
  probationRegions,
}
