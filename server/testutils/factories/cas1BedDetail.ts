import { Factory } from 'fishery'
import type { BedStatus, Cas1BedDetail, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'

const bedStatuses: ReadonlyArray<BedStatus> = ['available', 'occupied', 'out_of_service']

export default Factory.define<Cas1BedDetail>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  status: faker.helpers.arrayElement(bedStatuses),
  characteristics: faker.helpers.arrayElements(Object.keys(roomCharacteristicMap)) as Array<Cas1SpaceCharacteristic>,
}))
