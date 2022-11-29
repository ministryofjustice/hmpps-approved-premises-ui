/* istanbul ignore file */
import { Task } from '../../utils/decorators'

import CaseNotes from './caseNotes'

const pages = {
  'case-notes': CaseNotes,
}

export default pages

@Task({
  slug: 'prison-information',
  name: 'Review prison information',
  pages: [CaseNotes],
})
export class PrisonInformation {}
