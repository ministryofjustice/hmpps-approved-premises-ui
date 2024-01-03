import type {
  ApprovedPremisesApplication as Application,
  Task,
  ApprovedPremisesUser as User,
} from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/tasks'

import { taskSummary, userTableRows } from '../../../server/utils/tasks'
import { kebabCase } from '../../../server/utils/utils'
import { shouldShowTableRows } from '../../helpers'

export default class AllocationsPage extends Page {
  constructor(
    private readonly application: Application,
    private readonly task: Task,
  ) {
    super(`Reallocate`)
  }

  static visit(application: Application, task: Task): AllocationsPage {
    cy.visit(paths.tasks.show({ id: task.id, taskType: kebabCase(task.taskType) }))
    return new AllocationsPage(application, task)
  }

  shouldShowInformationAboutTask() {
    const summaryListItems = taskSummary(this.task, this.application)

    summaryListItems.forEach(item => {
      const key = 'text' in item.key ? item.key.text : item.key.html
      const value = 'text' in item.value ? item.value.text : item.value.html
      this.assertDefinition(key, value)
    })
  }

  shouldShowUserTable(users: Array<User>, task: Task) {
    shouldShowTableRows(userTableRows(users, task, 'csrfToken' as string))
  }

  clickAllocateToUser(user: User) {
    cy.get(`button[data-cy-userId="${user.id}"]`).click()
  }
}
