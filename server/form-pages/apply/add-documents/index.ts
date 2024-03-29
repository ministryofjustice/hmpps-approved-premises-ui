/* istanbul ignore file */

import AttachDocuments from './attachDocuments'
import { Section, Task } from '../../utils/decorators'

@Task({
  name: 'Attach required documents',
  slug: 'attach-required-documents',
  pages: [AttachDocuments],
})
@Section({
  title: 'Add documents',
  tasks: [AddDocuments],
})
export default class AddDocuments {}
