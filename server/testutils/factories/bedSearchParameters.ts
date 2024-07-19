import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { ApprovedPremisesBedSearchParameters as BedSearchParameters } from '../../@types/shared'
import { SpaceSearchParametersUi } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'
import { placementCriteria } from './placementRequest'

export const bedSearchParametersFactory = Factory.define<BedSearchParameters>(() => ({
  serviceName: 'approved-premises',
  durationDays: faker.number.int({ min: 1, max: 90 }),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  maxDistanceMiles: faker.number.int({ min: 1, max: 100 }),
  postcodeDistrict: 'SW11',
  requiredCharacteristics: faker.helpers.arrayElements(placementCriteria),
}))

export const bedSearchParametersUiFactory = Factory.define<SpaceSearchParametersUi>(() => ({
  durationWeeks: faker.number.int({ min: 12, max: 52 }).toString(),
  durationDays: faker.number.int({ min: 0, max: 6 }).toString(),
  maxDistanceMiles: faker.number.int({ min: 1, max: 100 }).toString(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  postcodeDistrict: 'SW11',
  requiredCharacteristics: faker.helpers.arrayElements(placementCriteria),
  crn: 'ABC123',
  applicationId: faker.string.uuid(),
  assessmentId: faker.string.uuid(),
}))
