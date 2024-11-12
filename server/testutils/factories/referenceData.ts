import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ReferenceData } from '@approved-premises/ui'

import departureReasonsJson from '../referenceData/stubs/departure-reasons.json'
import moveOnCategoriesJson from '../referenceData/stubs/move-on-categories.json'
import destinationProvidersJson from '../referenceData/stubs/destination-providers.json'
import cancellationReasonsJson from '../referenceData/stubs/cancellation-reasons.json'
import lostBedReasonsJson from '../referenceData/stubs/lost-bed-reasons.json'
import nonArrivalReasonsJson from '../referenceData/stubs/non-arrival-reasons.json'
import probationRegionsJson from '../referenceData/stubs/probation-regions.json'
import { ApArea, NonArrivalReason, ProbationRegion } from '../../@types/shared'

class ReferenceDataFactory extends Factory<ReferenceData> {
  departureReasons() {
    const data = faker.helpers.arrayElement(departureReasonsJson)
    return this.params(data)
  }

  moveOnCategories() {
    const data = faker.helpers.arrayElement(moveOnCategoriesJson)
    return this.params(data)
  }

  destinationProviders() {
    const data = faker.helpers.arrayElement(destinationProvidersJson)
    return this.params(data)
  }

  cancellationReasons() {
    const data = faker.helpers.arrayElement(cancellationReasonsJson)
    return this.params(data)
  }

  lostBedReasons() {
    const data = faker.helpers.arrayElement(lostBedReasonsJson)
    return this.params(data)
  }

  nonArrivalReason() {
    const data = faker.helpers.arrayElement(nonArrivalReasonsJson)
    return this.params(data)
  }

  probationRegions() {
    const data = faker.helpers.arrayElement(probationRegionsJson)
    return this.params(data)
  }
}

export default ReferenceDataFactory.define(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  serviceScope: 'approved-premises',
  isActive: true,
  parent: null,
}))

export const probationRegionFactory = ReferenceDataFactory.define<ProbationRegion>(() =>
  faker.helpers.arrayElement(probationRegionsJson),
)

export const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.string.uuid(),
  name: faker.location.city(),
  identifier: faker.location.countryCode(),
}))

export const nonArrivalReasonsFactory = Factory.define<NonArrivalReason>(() => ({
  id: faker.string.uuid(),
  name: faker.word.words(2),
  isActive: faker.datatype.boolean(),
}))
