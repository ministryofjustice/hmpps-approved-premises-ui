import { Task } from '../../../utils/decorators'

import SufficentInformationPage from './sufficientInformation'
import InformationReceived from './informationReceived'
import SufficientInformationConfirm from './sufficientInformationConfirm'
import SufficientInformationSent from './sufficientInformationSent'

@Task({
  slug: 'sufficient-information',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficentInformationPage, InformationReceived, SufficientInformationConfirm, SufficientInformationSent],
})
export default class SufficientInformation {}
