import { Factory } from 'fishery'
import { Cas1NewDeparture } from '@approved-premises/api'
import { faker } from '@faker-js/faker'

export default Factory.define<Cas1NewDeparture>(() => {
  const departureDateTime = faker.date.recent({ days: 1 })
  departureDateTime.setSeconds(0)
  departureDateTime.setMilliseconds(0)

  return {
    departureDateTime: departureDateTime.toISOString(),
    reasonId: faker.string.uuid(),
    moveOnCategoryId: faker.string.uuid(),
    notes: faker.word.words(),
  }
})
