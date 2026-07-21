import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { TierDto } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

const v3EligibleTiers = ['A', 'B', 'C']
const v3IneligibleTiers = ['D', 'E', 'F', 'G']
const v2EligibleTiers = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']
const v2IneligibleTiers = ['C1', 'C2', 'C3']

class TierDtoFactory extends Factory<TierDto> {
  v3() {
    return this.params({
      tierScore: faker.helpers.arrayElement([...v3EligibleTiers, ...v3IneligibleTiers]),
      version: 'V3',
    })
  }

  v2() {
    return this.params({
      tierScore: faker.helpers.arrayElement([...v2EligibleTiers, ...v2IneligibleTiers]),
      version: 'V2',
    })
  }

  v2Eligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(v2EligibleTiers), version: 'V2' })
  }

  v2Ineligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(v2IneligibleTiers), version: 'V2' })
  }
}

export default TierDtoFactory.define(() => ({
  calculationDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
  provisional: faker.datatype.boolean(),
  tierScore: faker.helpers.arrayElement([...v3EligibleTiers, ...v3IneligibleTiers]),
  version: faker.helpers.arrayElement(['V2', 'V3']) as TierDto['version'],
}))
