import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchParameters } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

import { placementCriteria } from './cas1PlacementRequestDetail'

export default Factory.define<Cas1SpaceSearchParameters>(() => {
  return {
    applicationId: faker.string.uuid(),
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
    targetPostcodeDistrict: faker.location.zipCode(),
    spaceCharacteristics: faker.helpers.arrayElements(placementCriteria),
  }
})
