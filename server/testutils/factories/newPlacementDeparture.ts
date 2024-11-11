import { Factory } from 'fishery'
import { Cas1NewDeparture } from '@approved-premises/api'
import { faker } from '@faker-js/faker'

export default Factory.define<Cas1NewDeparture>(() => ({
  departureDateTime: faker.date.recent({ days: 1 }).toISOString(),
  reasonId: faker.string.uuid(),
  moveOnCategoryId: faker.string.uuid(),
  notes: faker.lorem.lines(),
}))
