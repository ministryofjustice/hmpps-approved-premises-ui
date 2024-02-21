import {
  assessmentTaskFactory,
  placementApplicationTaskFactory,
  placementRequestTaskFactory,
} from '../../testutils/factories'
import { isAssessmentTask, isPlacementApplicationTask, isPlacementRequestTask } from './assertions'

describe('assertions', () => {
  ;[isAssessmentTask, isPlacementApplicationTask, isPlacementRequestTask].forEach(assertion => {
    describe(assertion, () => {
      ;[
        {
          task: placementRequestTaskFactory.build(),
          expectedResponse: assertion === isPlacementRequestTask,
        },
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
