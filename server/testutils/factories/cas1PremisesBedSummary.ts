import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { Cas1PremisesBedSummary, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'

export default Factory.define<Cas1PremisesBedSummary>(() => ({
  id: faker.string.uuid(),
  bedName: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  characteristics: Object.keys(roomCharacteristicMap) as Array<Cas1SpaceBookingCharacteristic>,
}))
