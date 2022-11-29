/* istanbul ignore file */
import { Task } from '../../utils/decorators'

import DescribeLocationFactors from './describeLocationFactors'
import PduTransfer from './pduTransfer'

const pages = {
  'describe-location-factors': DescribeLocationFactors,
  'pdu-transfer': PduTransfer,
}

export default pages

@Task({
  slug: 'location-factors',
  name: 'Describe location factors',
  pages: [DescribeLocationFactors, PduTransfer],
})
export class LocationFactors {}
