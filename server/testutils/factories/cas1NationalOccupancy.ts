import { Factory } from 'fishery'
import {
  Cas1NationalOccupancy,
  type Cas1NationalOccupancyParameters,
  Cas1NationalOccupancyPremises,
  Cas1PremiseCapacitySummary,
  Cas1SpaceCharacteristic,
} from '@approved-premises/api'
import { addDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { roomCharacteristicMap, spaceSearchCriteriaApLevelLabels } from '../../utils/characteristicsUtils'
import cas1PremisesSearchResultSummaryFactory from './cas1PremisesSearchResultSummary'
import postcodeAreas from '../../etc/postcodeAreas.json'

export const cas1PremisesCapacitySummaryFactory = Factory.define<Cas1PremiseCapacitySummary>(() => ({
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  forRoomCharacteristic: faker.helpers.arrayElement(Object.keys(roomCharacteristicMap)) as Cas1SpaceCharacteristic,
  inServiceBedCount: faker.number.int({ min: 0, max: 20 }),
  vacantBedCount: faker.number.int({ min: -5, max: 20 }),
}))

export const cas1NationalOccupancyPremisesFactory = Factory.define<Cas1NationalOccupancyPremises>(() => {
  const capacity = Object.keys(roomCharacteristicMap).map((characteristic: Cas1SpaceCharacteristic) =>
    cas1PremisesCapacitySummaryFactory.build({ forRoomCharacteristic: characteristic }),
  )
  return {
    capacity,
    distanceInMiles: faker.number.float({ min: 1, max: 250 }),
    summary: cas1PremisesSearchResultSummaryFactory.build(),
  }
})

export const cas1NationalOccupancyParametersFactory = Factory.define<Cas1NationalOccupancyParameters>(() => ({
  fromDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  cruManagementAreaIds: new Array(faker.number.int({ min: 1, max: 4 })).map(() => faker.string.uuid()),
  postcodeArea: faker.helpers.arrayElement(postcodeAreas),
  premisesCharacteristics: faker.helpers.arrayElements(
    Object.keys(spaceSearchCriteriaApLevelLabels),
  ) as Array<Cas1SpaceCharacteristic>,
  roomCharacteristics: faker.helpers.arrayElements(
    Object.keys(roomCharacteristicMap),
  ) as Array<Cas1SpaceCharacteristic>,
}))

export default Factory.define<Cas1NationalOccupancy>(() => {
  const startDate = DateFormats.dateObjToIsoDate(new Date())
  const endDate = DateFormats.dateObjToIsoDate(addDays(startDate, 5))
  return {
    startDate,
    endDate,
    premises: cas1NationalOccupancyPremisesFactory.buildList(5),
  }
})
