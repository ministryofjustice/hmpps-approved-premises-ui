import { Task } from '../../../utils/decorators'

import SufficentInformationPage from './sufficientInformation'
import InformationReceived from './informationReceived'

@Task({
  slug: 'sufficient-information',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficentInformationPage, InformationReceived],
})
export default class SufficientInformation {}
