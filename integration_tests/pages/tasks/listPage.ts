import Page from '../page'
import paths from '../../../server/paths/tasks'

import { allocatedTableRows, unallocatedTableRows } from '../../../server/utils/tasks/table'

import { Task } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor(
    private readonly allocatedTasks: Array<Task>,
    private readonly unallocatedTasks: Array<Task>,
  ) {
    super('Tasks')
    this.allocatedTasks = allocatedTasks
    this.unallocatedTasks = unallocatedTasks
  }

  static visit(allocatedTasks: Array<Task>, unallocatedTasks: Array<Task>): ListPage {
    cy.visit(paths.tasks.index({}))
    return new ListPage(allocatedTasks, unallocatedTasks)
  }

  shouldShowAllocatedTasks(allocatedTasks = this.allocatedTasks): void {
    shouldShowTableRows(allocatedTasks, allocatedTableRows)
  }

  shouldShowUnallocatedTasks(): void {
    cy.get('a').contains('Unallocated').click()
    shouldShowTableRows(this.unallocatedTasks, unallocatedTableRows)
  }

  clickTask(task: Task) {
    cy.get(`a[data-cy-taskId="${task.id}"]`).click()
  }
}
