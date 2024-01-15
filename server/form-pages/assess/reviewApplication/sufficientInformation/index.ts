import { Task } from '../../../utils/decorators'

import SufficentInformationPage from './sufficientInformation'
import InformationReceived from './informationReceived'
import SufficientInformationConfirm from './sufficientInformationConfirm'

@Task({
  slug: 'sufficient-information',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficentInformationPage, InformationReceived, SufficientInformationConfirm],
})
export default class SufficientInformation {}
