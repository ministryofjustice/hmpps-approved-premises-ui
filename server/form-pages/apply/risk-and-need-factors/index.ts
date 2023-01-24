import { Section } from '../../utils/decorators'

import AccessAndHealthcare from './access-and-healthcare'
import FurtherConsiderations from './further-considerations'
import LocationFactors from './location-factors'
import OasysImport from './oasys-import'
import PrisonInformation from './prison-information'
import RiskManagement from './risk-management-features'

@Section({
  title: 'Risk and need factors',
  tasks: [OasysImport, RiskManagement, PrisonInformation, LocationFactors, AccessAndHealthcare, FurtherConsiderations],
})
export default class RiskAndNeedFactors {}
