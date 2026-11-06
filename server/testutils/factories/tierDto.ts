import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { TierDto, TierVersionDto } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

const eligibleTiers = ['A', 'B', 'C']
const ineligibleTiers = ['D', 'E', 'F', 'G']

class TierDtoFactory extends Factory<TierDto> {
  eligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(eligibleTiers) })
  }

  ineligible() {
    return this.params({ tierScore: faker.helpers.arrayElement(ineligibleTiers) })
  }
}

export default TierDtoFactory.define(() => ({
  calculationDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 365 })),
  provisional: faker.datatype.boolean(),
  tierScore: faker.helpers.arrayElement([...eligibleTiers, ...ineligibleTiers]),
  version: 'V3' as TierVersionDto,
}))
