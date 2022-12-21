/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import DescribeLocationFactors from './describeLocationFactors'

@Task({
  slug: 'location-factors',
  name: 'Describe location factors',
  pages: [DescribeLocationFactors],
})
export default class LocationFactors {}
