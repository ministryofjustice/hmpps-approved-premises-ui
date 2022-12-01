/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import ApType from './apType'
import PipeReferral from './pipeReferral'
import PipeOpdScreening from './pipeOpdScreening'
import EsapPlacementScreening from './esapPlacementScreening'
import EsapPlacementSecreting from './esapPlacementSecreting'
import EsapPlacementCCTV from './esapPlacementCCTV'

const pages = {
  'ap-type': ApType,
  'pipe-referral': PipeReferral,
  'pipe-opd-screening': PipeOpdScreening,
  'esap-placement-screening': EsapPlacementScreening,
  'esap-placement-secreting': EsapPlacementSecreting,
  'esap-placement-cctv': EsapPlacementCCTV,
}

export default pages

@Task({
  slug: 'type-of-ap',
  name: 'Type of AP required',
  pages: [ApType, PipeReferral, PipeOpdScreening, EsapPlacementScreening, EsapPlacementSecreting, EsapPlacementCCTV],
})
export class TypeOfAp {}
