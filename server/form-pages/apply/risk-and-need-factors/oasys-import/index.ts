/* istanbul ignore file */
import { Task } from '../../../utils/decorators'
import config from '../../../../config'

import OptionalOasysSections from './optionalOasysSections'
import RoshSummary from './roshSummary'
import OffenceDetails from './offenceDetails'
import SupportingInformation from './supportingInformation'
import RiskManagementPlan from './riskManagementPlan'
import RiskToSelf from './riskToSelf'

const pages = config.flags.oasysDisabled
  ? [RoshSummary, OffenceDetails, SupportingInformation, RiskManagementPlan, RiskToSelf]
  : [OptionalOasysSections, RoshSummary, OffenceDetails, SupportingInformation, RiskManagementPlan, RiskToSelf]

@Task({
  slug: 'oasys-import',
  name: config.flags.oasysDisabled ? 'Add OASys Information' : 'Choose sections of OASys to import',
  pages,
})
export default class OasysImport {}
