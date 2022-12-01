import { Section } from '../../utils/decorators'

import AccessAndHealthcare from './access-and-healthcare'
import FurtherConsiderations from './further-considerations'
import LocationFactors from './location-factors'
import PrisonInformation from './prison-information'
import RiskManagement from './risk-management-features'

@Section({
  name: 'Risk and need factors',
  tasks: [RiskManagement, PrisonInformation, LocationFactors, AccessAndHealthcare, FurtherConsiderations],
})
export default class RiskAndNeedFactors {}
