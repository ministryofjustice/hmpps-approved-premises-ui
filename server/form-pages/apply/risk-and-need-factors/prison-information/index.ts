/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import CaseNotes from './caseNotes'

@Task({
  slug: 'prison-information',
  name: 'Review prison information',
  pages: [CaseNotes],
})
export default class PrisonInformation {}
