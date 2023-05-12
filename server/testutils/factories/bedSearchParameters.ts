import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { ApprovedPremisesBedSearchParameters as BedSearchParameters } from '../../@types/shared'
import { BedSearchParametersUi } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'
import { placementCriteria } from './placementRequest'

export const bedSearchParametersFactory = Factory.define<BedSearchParameters>(() => ({
  serviceName: 'approved-premises',
  durationDays: faker.datatype.number({ min: 1, max: 90 }),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  maxDistanceMiles: faker.datatype.number({ min: 1, max: 100 }),
  postcodeDistrict: 'SW11',
  requiredCharacteristics: faker.helpers.arrayElements(placementCriteria),
}))

export const bedSearchParametersUiFactory = Factory.define<BedSearchParametersUi>(() => ({
  durationWeeks: faker.datatype.number({ min: 12, max: 52 }).toString(),
  maxDistanceMiles: faker.datatype.number({ min: 1, max: 100 }).toString(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  postcodeDistrict: 'SW11',
  requiredCharacteristics: faker.helpers.arrayElements(placementCriteria),
  selectedRequiredCharacteristics: faker.helpers.arrayElements(placementCriteria),
  crn: 'ABC123',
  applicationId: faker.datatype.uuid(),
  assessmentId: faker.datatype.uuid(),
}))
