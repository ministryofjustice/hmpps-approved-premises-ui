import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceSearchParameters, Cas1SpaceSearchRequirements } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { filterOutAPTypes } from '../../utils/match'
import { placementCriteria } from './placementRequest'
import { apTypes } from '../../utils/placementCriteriaUtils'

const spaceBookingRequirements = Factory.define<Cas1SpaceSearchRequirements>(() => {
  return {
    apType: faker.helpers.arrayElement(apTypes),
    spaceCharacteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    gender: faker.helpers.arrayElement(['male', 'female']),
  }
})

export default Factory.define<Cas1SpaceSearchParameters>(() => {
  return {
    applicationId: faker.string.uuid(),
    startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
    targetPostcodeDistrict: faker.location.zipCode(),
    requirements: spaceBookingRequirements.build(),
  }
})
