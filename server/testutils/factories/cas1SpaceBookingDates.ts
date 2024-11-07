import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1SpaceBookingDates } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1SpaceBookingDates>(() => {
  const startDate = faker.date.anytime()
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(startDate)
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 365, refDate: startDate }))

  return {
    id: faker.string.uuid(),
    canonicalArrivalDate,
    canonicalDepartureDate,
  }
})
