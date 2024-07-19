import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchResult } from '@approved-premises/api'
import premisesSearchResultSummary from './premisesSearchResultSummary'
import spaceCategoryAvailability from './spaceAvailability'

export default Factory.define<Cas1SpaceSearchResult>(() => {
  return {
    premises: premisesSearchResultSummary.build(),
    distanceInMiles: faker.number.int({ min: 1, max: 300 }),
    spacesAvailable: spaceCategoryAvailability.buildList(3),
  }
})
