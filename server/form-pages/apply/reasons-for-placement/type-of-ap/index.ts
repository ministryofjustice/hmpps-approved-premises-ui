/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import ApType from './apType'
import PipeReferral from './pipeReferral'
import PipeOpdScreening from './pipeOpdScreening'
import EsapPlacementScreening from './esapPlacementScreening'
import EsapPlacementSecreting from './esapPlacementSecreting'
import EsapPlacementCCTV from './esapPlacementCCTV'
import EsapNationalSecurityDivision from './esapNationalSecurityDivision'
import EsapExceptionalCase from './esapExceptionalCase'
import EsapNotEligible from './esapNotEligible'

@Task({
  slug: 'type-of-ap',
  name: 'Type of AP required',
  pages: [
    ApType,
    EsapNationalSecurityDivision,
    EsapExceptionalCase,
    EsapNotEligible,
    PipeReferral,
    PipeOpdScreening,
    EsapPlacementScreening,
    EsapPlacementSecreting,
    EsapPlacementCCTV,
  ],
})
export default class TypeOfAp {}
