import { Factory } from 'fishery'
import { Cas1RequestsForPlacementDurationsCalculationResponseDto } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'

class Cas1RequestsForPlacementDurationsCalculationResponseDtoFactory extends Factory<Cas1RequestsForPlacementDurationsCalculationResponseDto> {}

export default Cas1RequestsForPlacementDurationsCalculationResponseDtoFactory.define(() => {
  const defaultDurationDays = faker.number.int({ min: 1, max: 365 })
  return {
    defaultDurationDays,
    maxDurationDays: faker.number.int({ min: defaultDurationDays, max: 365 }),
  }
})
