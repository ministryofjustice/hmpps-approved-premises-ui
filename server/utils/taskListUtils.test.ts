import { Task } from '../@types/ui'
import paths from '../paths/apply'
import applicationFactory from '../testutils/factories/application'
import taskLinkHelper from './taskListUtils'

describe('taskListUtils', () => {
  describe('taskLinkHelper', () => {
    const task = {
      id: 'type-of-ap',
      title: 'Type of Approved Premises required',
      pages: { foo: 'bar', bar: 'baz' },
    } as Task

    it('should return a link to a task when the previous task is complete', () => {
      const application = applicationFactory.build({ id: 'some-uuid', data: { 'basic-information': { foo: 'bar' } } })

      expect(taskLinkHelper(task, application, 'applications')).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'foo',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })

    it('should return the task name when the previous task is incomplete', () => {
      const application = applicationFactory.build({ id: 'some-uuid' })

      expect(taskLinkHelper(task, application, 'applications')).toEqual(`Type of Approved Premises required`)
    })
  })
})
