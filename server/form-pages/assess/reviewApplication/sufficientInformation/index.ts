import { Task } from '../../../utils/decorators'

import SufficentInformationPage from './sufficientInformation'
import RequestInformation from './requestInformation'

@Task({
  slug: 'sufficient-information',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficentInformationPage, RequestInformation],
})
export default class SufficientInformation {}
