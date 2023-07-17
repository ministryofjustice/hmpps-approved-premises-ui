/* istanbul ignore file */
import { Task } from '../../../utils/decorators'

import DescribeLocationFactors from './describeLocationFactors'
import PreferredAps from './preferredAps'

@Task({
  slug: 'location-factors',
  name: 'Describe location factors',
  pages: [DescribeLocationFactors, PreferredAps],
})
export default class LocationFactors {}
