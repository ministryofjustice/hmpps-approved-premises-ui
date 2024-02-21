import { AssessmentTask, PlacementApplicationTask, PlacementRequestTask, Task } from '../../@types/shared'

const isAssessmentTask = (task: Task): task is AssessmentTask =>
  (task as AssessmentTask)?.createdFromAppeal !== undefined && task.taskType === 'Assessment'

const isPlacementApplicationTask = (task: Task): task is PlacementApplicationTask =>
  (task as PlacementApplicationTask).taskType === 'PlacementApplication'

const isPlacementRequestTask = (task: Task): task is PlacementRequestTask =>
  (task as PlacementRequestTask).taskType === 'PlacementRequest'

export { isAssessmentTask, isPlacementApplicationTask, isPlacementRequestTask }
