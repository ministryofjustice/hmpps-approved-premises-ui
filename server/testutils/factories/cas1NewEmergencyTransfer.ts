import { Factory } from 'fishery'
import type { Cas1NewEmergencyTransfer } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NewEmergencyTransfer>(() => ({
  destinationPremisesId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 7 })),
  departureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
