import { Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { SpaceSearchRoomCriteria, spaceSearchCriteriaRoomLevelLabels } from '../../utils/match/spaceSearch'

export default Factory.define<Cas1UpdateSpaceBooking>(() => {
  const arrivalDate = faker.date.soon()
  const departureDate = faker.date.soon({ refDate: arrivalDate })

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
    characteristics: faker.helpers.arrayElements(
      Object.keys(spaceSearchCriteriaRoomLevelLabels),
    ) as Array<SpaceSearchRoomCriteria>,
  }
})
