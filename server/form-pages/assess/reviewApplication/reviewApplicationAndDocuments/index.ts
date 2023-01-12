import { Task } from '../../../utils/decorators'

import Review from './review'

@Task({
  slug: 'review-application',
  name: 'Review application and documents',
  pages: [Review],
})
export default class ReviewApplicationAndDocuments {}
