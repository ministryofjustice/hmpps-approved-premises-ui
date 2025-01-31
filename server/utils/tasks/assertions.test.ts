import { assessmentTaskFactory, placementApplicationTaskFactory } from '../../testutils/factories'
import { isAssessmentTask, isPlacementApplicationTask } from './assertions'

describe('assertions', () => {
  ;[isAssessmentTask, isPlacementApplicationTask].forEach(assertion => {
    describe(assertion, () => {
      ;[
        {
          task: placementApplicationTaskFactory.build(),
          expectedResponse: assertion === isPlacementApplicationTask,
        },
        {
          task: assessmentTaskFactory.build(),
          expectedResponse: assertion === isAssessmentTask,
        },
      ].forEach(args => {
        it(`Should return ${args.expectedResponse} for ${args.task.taskType}`, () => {
          expect(assertion(args.task)).toEqual(args.expectedResponse)
        })
      })
    })
  })
})
