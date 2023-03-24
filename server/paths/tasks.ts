/* istanbul ignore file */

import { path } from 'static-path'
import applyPaths from './apply'

const tasksPath = path('/tasks')

const allocationPath = applyPaths.applications.show.path('allocation')
const taskPath = applyPaths.applications.show.path('tasks/:taskType')

export default {
  index: tasksPath,
  show: taskPath,
  allocations: {
    create: allocationPath,
  },
}
