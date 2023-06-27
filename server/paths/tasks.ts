/* istanbul ignore file */

import { path } from 'static-path'

const tasksPath = path('/tasks')

const taskPath = tasksPath.path(':taskType/:id')

export default {
  tasks: {
    index: tasksPath,
    show: taskPath,
    allocations: {
      create: taskPath.path('allocations'),
    },
  },
}
