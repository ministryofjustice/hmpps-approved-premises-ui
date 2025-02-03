import { AssessmentTask, PlacementApplicationTask, Task } from '../../@types/shared'

const isAssessmentTask = (task: Task): task is AssessmentTask =>
  (task as AssessmentTask)?.createdFromAppeal !== undefined && task.taskType === 'Assessment'

const isPlacementApplicationTask = (task: Task): task is PlacementApplicationTask =>
  (task as PlacementApplicationTask).taskType === 'PlacementApplication'

export { isAssessmentTask, isPlacementApplicationTask }
