import { ApprovedPremisesApplication, ApprovedPremisesAssessment } from '../@types/shared'
import { SummaryListItem, Task } from '../@types/ui'
import Apply from '../form-pages/apply'

const reviewSections = (
  application: ApprovedPremisesApplication,
  rowFunction: (
    task: Task,
    document: ApprovedPremisesApplication | ApprovedPremisesAssessment,
  ) => Array<SummaryListItem>,
) => {
  const nonCheckYourAnswersSections = Apply.sections.slice(0, -1)

  return nonCheckYourAnswersSections.map(section => {
    return {
      title: section.title,
      tasks: section.tasks.map(task => {
        return {
          id: task.id,
          title: task.title,
          rows: rowFunction(task, application),
        }
      }),
    }
  })
}

export default reviewSections
