import Page from '../page'
import paths from '../../../server/paths/tasks'

import { allocatedTableRows, unallocatedTableRows } from '../../../server/utils/tasks/listTable'

import { Task } from '../../../server/@types/shared'
import { shouldShowTableRows } from '../../helpers'

export default class ListPage extends Page {
  constructor(
    private readonly allocatedTasks: Array<Task>,
    private readonly unallocatedTasks: Array<Task>,
  ) {
    super('Task Allocation')
    this.allocatedTasks = allocatedTasks
    this.unallocatedTasks = unallocatedTasks
  }

  static visit(allocatedTasks: Array<Task>, unallocatedTasks: Array<Task>, query?: string): ListPage {
    const path = paths.tasks.index({})
    cy.visit(query ? `${path}?${query}` : path)
    return new ListPage(allocatedTasks, unallocatedTasks)
  }

  shouldShowAllocatedTasks(allocatedTasks = this.allocatedTasks): void {
    shouldShowTableRows(allocatedTableRows(allocatedTasks))
  }

  shouldShowUnallocatedTasks(unallocatedTasks = this.unallocatedTasks): void {
    shouldShowTableRows(unallocatedTableRows(unallocatedTasks))
  }

  clickTask(task: Task) {
    cy.get(`a[data-cy-taskId="${task.id}"]`).click()
  }

  clickTab(tabName: string): void {
    cy.get('a').contains(tabName).click()
  }
}
