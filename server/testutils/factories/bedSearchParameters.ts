import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { ApprovedPremisesBedSearchParameters as BedSearchParameters } from '../../@types/shared'
import { BedSearchParametersUi } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<BedSearchParameters, unknown, Partial<BedSearchParametersUi>>(() => ({
  serviceName: 'approved-premises',
  durationDays: faker.datatype.number({ min: 1, max: 90 }),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  maxDistanceMiles: faker.datatype.number({ min: 1, max: 100 }),
  postcodeDistrict: 'SW11',
  requiredCharacteristics: faker.helpers.arrayElements([
    'isIAP',
    'isPIPE',
    'isESAP',
    'isSemiSpecialistMentalHealth',
    'isRecoveryFocussed',
    'isSuitableForVulnerable',
    'acceptsSexOffenders',
    'acceptsChildSexOffenders',
    'acceptsNonSexualChildOffenders',
    'acceptsHateCrimeOffenders',
    'isCatered',
    'hasWideStepFreeAccess',
    'hasWideAccessToCommunalAreas',
    'hasStepFreeAccessToCommunalAreas',
    'hasWheelChairAccessibleBathrooms',
    'hasLift',
    'hasTactileFlooring',
    'hasBrailleSignage',
    'hasHearingLoop',
    'additionalRestrictions',
  ]),
}))
