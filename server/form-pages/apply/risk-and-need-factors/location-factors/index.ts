/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import DescribeLocationFactors from './describeLocationFactors'
import PduTransfer from './pduTransfer'

@Task({
  slug: 'location-factors',
  name: 'Describe location factors',
  pages: [DescribeLocationFactors, PduTransfer],
})
export default class LocationFactors {}
