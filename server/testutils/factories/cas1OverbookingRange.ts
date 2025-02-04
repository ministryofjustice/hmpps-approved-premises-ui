import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1OverbookingRange } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1OverbookingRange>(() => {
  const from = faker.date.soon({ days: 80 })
  const to = new Date(from).setDate(from.getDate() + faker.number.int({ max: 5 }))
  return {
    startInclusive: DateFormats.dateObjToIsoDate(from),
    endInclusive: DateFormats.dateObjToIsoDate(faker.date.between({ from, to })),
  }
})
