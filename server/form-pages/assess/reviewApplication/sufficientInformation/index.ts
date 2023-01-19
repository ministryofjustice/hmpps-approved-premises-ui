import { Task } from '../../../utils/decorators'

import SufficentInformationPage from './sufficientInformation'

@Task({
  slug: 'sufficient-information',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficentInformationPage],
})
export default class SufficientInformation {}
