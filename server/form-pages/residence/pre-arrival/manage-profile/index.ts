import { Section } from '../../../utils/decorators'

import RiskInformation from './risk-Information'

@Section({
  title: 'Manage profile',
  tasks: [RiskInformation],
})
export default class ManageProfile {}
