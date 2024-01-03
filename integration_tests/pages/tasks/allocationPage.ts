import type {
  ApprovedPremisesApplication as Application,
  Task,
  ApprovedPremisesUser as User,
} from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/tasks'

import { taskSummary } from '../../../server/utils/tasks'
import { kebabCase } from '../../../server/utils/utils'

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

  shouldShowUsers(users: Array<User>) {
    cy.get('select#userId option').should('have.length', users.length + 1)

    users.forEach(u => {
      cy.get('select#userId option').contains(u.name).should('be.visible')
    })
  }

  selectUser(user: User) {
    this.getSelectInputByIdAndSelectAnEntry('userId', user.id)
  }
}
