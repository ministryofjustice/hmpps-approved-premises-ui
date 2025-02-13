import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays } from 'date-fns'
import postcodeAreas from '../../etc/postcodeAreas.json'
import { ApTypeCriteria, apTypeCriteriaLabels } from '../../utils/placementCriteriaUtils'
import {
  SpaceSearchApCriteria,
  SpaceSearchRoomCriteria,
  SpaceSearchState,
  spaceSearchCriteriaApLevelLabels,
} from '../../utils/match/spaceSearch'
import { DateFormats } from '../../utils/dateUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'

export default Factory.define<SpaceSearchState>(() => {
  const arrivalDate = faker.date.soon()
  const durationDays = faker.number.int({ min: 1, max: 84 })
  const departureDate = addDays(arrivalDate, durationDays)

  return {
    applicationId: faker.string.uuid(),
    postcode: faker.helpers.arrayElement(postcodeAreas),
    apType: faker.helpers.arrayElement(Object.keys(apTypeCriteriaLabels)) as ApTypeCriteria,
    apCriteria: faker.helpers.arrayElements(
      Object.keys(spaceSearchCriteriaApLevelLabels),
    ) as Array<SpaceSearchApCriteria>,
    roomCriteria: faker.helpers.arrayElements(Object.keys(roomCharacteristicMap)) as Array<SpaceSearchRoomCriteria>,
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationDays,
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(departureDate),
  }
})
