import { Cas1PremisesLocalRestrictionSummary } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1PremisesLocalRestrictionSummary>(() => ({
  id: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  description: faker.word.words({ count: { min: 1, max: 5 } }),
}))
