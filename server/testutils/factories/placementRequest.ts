import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { PlacementRequest } from '../../@types/shared'
import { DateFormats } from '../../utils/dateUtils'
import personFactory from './person'
import risksFactory from './risks'
import userFactory from './user'

export default Factory.define<PlacementRequest>(() => ({
  id: faker.datatype.uuid(),
  gender: faker.helpers.arrayElement(['male', 'female']),
  type: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap']),
  expectedArrival: DateFormats.dateObjToIsoDate(faker.date.soon()),
  duration: faker.datatype.number({ min: 1, max: 12 }),
  location: 'NE1',
  radius: faker.datatype.number({ min: 1, max: 50 }),
  essentialCriteria: faker.helpers.arrayElements(placementCriteria),
  desirableCriteria: faker.helpers.arrayElements(placementCriteria),
  mentalHealthSupport: faker.datatype.boolean(),
  person: personFactory.build(),
  risks: risksFactory.build(),
  applicationId: faker.datatype.uuid(),
  assessmentId: faker.datatype.uuid(),
  releaseType: faker.helpers.arrayElement(['licence', 'rotl', 'hdc', 'pss', 'in_community']),
  status: faker.helpers.arrayElement(['notMatched', 'unableToMatch', 'matched']),
  assessmentDecision: faker.helpers.arrayElement(['accepted' as const, 'rejected' as const, undefined]),
  assessmentDate: DateFormats.dateObjToIsoDateTime(faker.date.soon()),
  assessor: userFactory.build(),
}))

const placementCriteria = [
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
] as const
