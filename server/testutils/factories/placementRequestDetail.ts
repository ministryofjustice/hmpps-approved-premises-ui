import { Factory } from 'fishery'
import { PlacementRequestDetail } from '../../@types/shared'

import cancellationFactory from './cancellation'
import placementRequestFactory from './placementRequest'

export default Factory.define<PlacementRequestDetail>(() => ({
  ...placementRequestFactory.build(),
  cancellations: cancellationFactory.buildList(2),
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
  'isGroundFloor',
  'hasEnSuite',
  'isSuitedForSexOffenders',
  'isArsonSuitable',
] as const
