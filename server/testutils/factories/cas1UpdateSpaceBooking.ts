import { Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { SpaceSearchRoomCriteria } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'

export default Factory.define<Cas1UpdateSpaceBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.soon({ refDate: arrivalDate })

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    characteristics: faker.helpers.arrayElements(Object.keys(roomCharacteristicMap)) as Array<SpaceSearchRoomCriteria>,
  }
})
