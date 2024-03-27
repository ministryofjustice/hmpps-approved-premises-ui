/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import SelectApType from './apType'
import PipeReferral from './pipeReferral'
import PipeOpdScreening from './pipeOpdScreening'
import EsapPlacementScreening from './esapPlacementScreening'
import EsapPlacementSecreting from './esapPlacementSecreting'
import EsapPlacementCCTV from './esapPlacementCCTV'
import EsapNationalSecurityDivision from './esapNationalSecurityDivision'
import EsapExceptionalCase from './esapExceptionalCase'
import EsapNotEligible from './esapNotEligible'
import RfapDetails from './rfapDetails'

@Task({
  slug: 'type-of-ap',
  name: 'Type of AP required',
  pages: [
    SelectApType,
    EsapNationalSecurityDivision,
    EsapExceptionalCase,
    EsapNotEligible,
    PipeReferral,
    PipeOpdScreening,
    EsapPlacementScreening,
    EsapPlacementSecreting,
    EsapPlacementCCTV,
    RfapDetails,
  ],
})
export default class TypeOfAp {}
