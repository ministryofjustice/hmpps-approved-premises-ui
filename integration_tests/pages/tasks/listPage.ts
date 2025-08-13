import Page from '../page'
import paths from '../../../server/paths/tasks'

import { allocatedTableRows, completedTableRows, unallocatedTableRows } from '../../../server/utils/tasks/listTable'

import { Task } from '../../../server/@types/shared'
import { shouldShowTableRows, tableRowsToArrays } from '../../helpers'

export default class ListPage extends Page {
  constructor() {
    super('Task Allocation')
  }

  static visit(query?: string): ListPage {
    const path = paths.tasks.index({})
    cy.visit(query ? `${path}?${query}` : path)
    return new ListPage()
  }

  shouldShowAllocatedTasks(tasks): void {
    shouldShowTableRows(allocatedTableRows(tasks))
  }

  shouldShowUnallocatedTasks(tasks): void {
    shouldShowTableRows(unallocatedTableRows(tasks))
  }

  shouldShowCompletedTasks(tasks): void {
    shouldShowTableRows(completedTableRows(tasks))
  }

  shouldContainHeaderLinks(tasks: Array<Task>): void {
    const headerTexts = tableRowsToArrays(allocatedTableRows(tasks)).map(row => row[0])
    headerTexts.forEach(text => {
      cy.contains('th a', text)
    })
  }

  shouldShowAllocatedToUserFilter() {
    cy.get('select#allocatedToUserId').should('exist')
  }

  shouldNotShowAllocatedToUserFilter() {
    cy.get('select#allocatedToUserId').should('not.exist')
  }

  clickTask(task: Task) {
    cy.get(`a[data-cy-taskId="${task.id}"]`).click()
  }

  clickTab(tabName: string): void {
    cy.get('a').contains(tabName).click()
  }
}
