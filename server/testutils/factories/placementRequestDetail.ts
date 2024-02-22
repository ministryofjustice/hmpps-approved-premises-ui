import { Factory } from 'fishery'
import { PlacementRequestDetail } from '../../@types/shared'

import cancellationFactory from './cancellation'
import { placementRequestFactory } from './placementRequest'
import bookingSummaryFactory from './bookingSummary'
import applicationFactory from './application'

export default Factory.define<PlacementRequestDetail>(() => ({
  ...placementRequestFactory.build(),
  cancellations: cancellationFactory.buildList(2),
  booking: bookingSummaryFactory.build(),
  application: applicationFactory.build(),
}))

export const placementCriteria = [
  'isPIPE',
  'isESAP',
  'isSemiSpecialistMentalHealth',
  'isRecoveryFocussed',
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsHateCrimeOffenders',
  'isWheelchairDesignated',
  'isSingle',
  'isStepFreeDesignated',
  'isCatered',
  'hasEnSuite',
  'isSuitedForSexOffenders',
  'isArsonSuitable',
] as const
