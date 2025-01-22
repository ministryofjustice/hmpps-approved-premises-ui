import { Factory } from 'fishery'
import { SpaceSearchState } from '@approved-premises/ui'
import { faker } from '@faker-js/faker/locale/en_GB'
import postcodeAreas from '../../etc/postcodeAreas.json'
import { ApTypeCriteria, apTypeCriteriaLabels } from '../../utils/placementCriteriaUtils'
import {
  SpaceSearchApCriteria,
  SpaceSearchRoomCriteria,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
} from '../../utils/match/spaceSearch'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<SpaceSearchState>(() => ({
  applicationId: faker.string.uuid(),
  postcode: faker.helpers.arrayElement(postcodeAreas),
  apType: faker.helpers.arrayElement(Object.keys(apTypeCriteriaLabels)) as ApTypeCriteria,
  apCriteria: faker.helpers.arrayElements(
    Object.keys(spaceSearchCriteriaApLevelLabels),
  ) as Array<SpaceSearchApCriteria>,
  roomCriteria: faker.helpers.arrayElements(
    Object.keys(spaceSearchCriteriaRoomLevelLabels),
  ) as Array<SpaceSearchRoomCriteria>,
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  durationDays: faker.number.int({ min: 1, max: 84 }),
}))
