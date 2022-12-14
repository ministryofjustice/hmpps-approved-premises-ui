/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import OptionalOasysSections from './optionalOasysSections'
import RoshSummary from './roshSummary'
import OffenceDetails from './offenceDetails'

@Task({
  slug: 'oasys-import',
  name: 'Choose sections of OASys to import',
  pages: [OptionalOasysSections, RoshSummary, OffenceDetails],
})
export default class OasysImport {}
