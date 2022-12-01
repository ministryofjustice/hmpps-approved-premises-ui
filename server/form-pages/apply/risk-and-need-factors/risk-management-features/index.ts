import { Task } from '../../../utils/decorators'

import RiskManagementFeatures from './riskManagementFeatures'
import ConvictedOffences from './convictedOffences'
import DateOfOffence from './dateOfOffence'
import TypeOfConvictedOffence from './typeOfConvictedOffence'
import RehabilitativeInterventions from './rehabilitativeInterventions'

@Task({
  slug: 'risk-management-features',
  name: 'Add detail about managing risks and needs',
  pages: [
    RiskManagementFeatures,
    ConvictedOffences,
    TypeOfConvictedOffence,
    DateOfOffence,
    RehabilitativeInterventions,
  ],
})
export default class RiskManagement {}
