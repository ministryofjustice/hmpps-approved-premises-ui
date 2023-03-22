import TaskClient from './taskClient'
import paths from '../paths/api'

import taskFactory from '../testutils/factories/task'
import describeClient from '../testutils/describeClient'

describeClient('taskClient', provider => {
  let taskClient: TaskClient

  const token = 'token-1'

  beforeEach(() => {
    taskClient = new TaskClient(token)
  })

  describe('all', () => {
    it('makes a get request to the tasks endpoint', async () => {
      const tasks = taskFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get a list of tasks`,
        withRequest: {
          method: 'GET',
          path: paths.tasks.index.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: tasks,
        },
      })

      const result = await taskClient.all()

      expect(result).toEqual(tasks)
    })
  })
})
