import { Task } from '../../../utils/decorators'

import RiskManagementFeatures from './riskManagementFeatures'
import ConvictedOffences from './convictedOffences'
import DateOfOffence from './dateOfOffence'
import TypeOfConvictedOffence from './typeOfConvictedOffence'
import RehabilitativeInterventions from './rehabilitativeInterventions'

export default {
  'risk-management-features': RiskManagementFeatures,
  'convicted-offences': ConvictedOffences,
  'type-of-convicted-offence': TypeOfConvictedOffence,
  'date-of-offence': DateOfOffence,
  'rehabilitative-interventions': RehabilitativeInterventions,
}

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
export class RiskManagement {}
