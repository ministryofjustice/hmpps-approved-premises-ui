/* istanbul ignore file */
import { Task } from '../../utils/decorators'

import Review from './reviewApplicationAndDocumentsPage'

@Task({
  slug: 'review-application',
  name: 'Review application and documents',
  pages: [Review],
})
export default class ReviewApplication {}
