import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { TierDto, TierVersionDto } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

const v3EligibleTiers = ['A', 'B', 'C']
const v3IneligibleTiers = ['D', 'E', 'F', 'G']

class TierDtoFactory extends Factory<TierDto> {
  eligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(v3EligibleTiers) })
  }

  ineligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(v3IneligibleTiers) })
  }
}

export default TierDtoFactory.define(() => ({
  calculationDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
  provisional: faker.datatype.boolean(),
  tierScore: faker.helpers.arrayElement([...v3EligibleTiers, ...v3IneligibleTiers]),
  version: 'V3' as TierVersionDto,
}))
