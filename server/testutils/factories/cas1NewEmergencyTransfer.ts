import { Factory } from 'fishery'
import type { Cas1NewEmergencyTransfer } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NewEmergencyTransfer>(() => ({
  destinationPremisesId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDate(addDays(faker.date.recent({ days: 8 }), 1)),
  departureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
