/* istanbul ignore file */

import { path } from 'static-path'
import applyPaths from './apply'

const tasksPath = path('/tasks')

const allocationPath = applyPaths.applications.show.path('allocation')

export default {
  index: tasksPath,
  allocations: {
    show: allocationPath,
  },
}
