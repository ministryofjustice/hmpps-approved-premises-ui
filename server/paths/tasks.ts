/* istanbul ignore file */

import { path } from 'static-path'
import applyPaths from './apply'

const tasksPath = path('/tasks')

const taskPath = applyPaths.applications.show.path('tasks/:taskType')

export default {
  index: tasksPath,
  show: taskPath,
  allocations: {
    create: taskPath.path('allocations'),
  },
}
