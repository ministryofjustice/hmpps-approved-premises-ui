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
    shouldShowTableRows(allocatedTableRows(tasks, true))
  }

  shouldShowUnallocatedTasks(tasks): void {
    shouldShowTableRows(unallocatedTableRows(tasks, true))
  }

  shouldShowCompletedTasks(tasks): void {
    shouldShowTableRows(completedTableRows(tasks))
  }

  private testContainsHeaderLinks(tasks: Array<Task>, shouldContain: boolean): void {
    const headerTexts = tableRowsToArrays(allocatedTableRows(tasks, true)).map(row => row[0])
    headerTexts.forEach(text => {
      cy.contains('th', text).within(() => {
        if (shouldContain) {
          cy.get('a').should('have.text', text)
        } else {
          cy.get('a').should('not.exist')
        }
      })
    })
  }

  shouldContainHeaderLinks(tasks: Array<Task>): void {
    this.testContainsHeaderLinks(tasks, true)
  }

  shouldNotContainHeaderLinks(tasks: Array<Task>): void {
    this.testContainsHeaderLinks(tasks, false)
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
