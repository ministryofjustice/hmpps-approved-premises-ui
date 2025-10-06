import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchResults } from '@approved-premises/api'
import spaceSearchResult from './spaceSearchResult'

export default Factory.define<Cas1SpaceSearchResults>(() => {
  const numberOfResults = faker.number.int({ min: 2, max: 10 })
  return {
    resultsCount: numberOfResults,
    results: spaceSearchResult.buildList(numberOfResults),
  }
})
