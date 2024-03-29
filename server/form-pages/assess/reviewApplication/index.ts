import { Section } from '../../utils/decorators'

import ReviewApplicationAndDocuments from './reviewApplicationAndDocuments'
import SufficientInformation from './sufficientInformation'

@Section({
  title: 'Review application',
  tasks: [ReviewApplicationAndDocuments, SufficientInformation],
})
export default class ReviewApplication {}
