import { Section } from '../../utils/decorators'

import ReviewApplicationAndDocuments from './reviewApplicationAndDocuments'

@Section({
  name: 'Review application',
  tasks: [ReviewApplicationAndDocuments],
})
export default class ReviewApplication {}
