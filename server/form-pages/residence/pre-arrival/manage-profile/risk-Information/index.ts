import { Task } from '../../../../utils/decorators'

import RiskToStaff from './risk-to-staff'
import RiskToResidents from './risk-to-residents'

@Task({
  slug: 'risk-information',
  name: 'Risk information',
  pages: [RiskToStaff, RiskToResidents],
})
export default class RiskInformation {}
