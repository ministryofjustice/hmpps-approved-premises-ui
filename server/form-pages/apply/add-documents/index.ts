/* istanbul ignore file */

import AttachDocuments from './attachDocuments'
import { Task, Section } from '../../utils/decorators'

@Task({
  name: 'Attach required documents',
  slug: 'attach-required-documents',
  pages: [AttachDocuments],
})
@Section({
  name: 'Add documents',
  tasks: [AddDocuments],
})
export default class AddDocuments {}
