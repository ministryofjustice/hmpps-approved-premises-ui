import { Factory } from 'fishery'
import type { TierDto } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { DateFormats } from '../../utils/dateUtils'

export const tierDtoFactory = Factory.define<TierDto>(() => ({
  calculationDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  provisional: false,
  tierScore: faker.string.alpha({ length: 1 }),
  version: 'V2',
}))
