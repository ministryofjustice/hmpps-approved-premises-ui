import { ApprovedPremisesApplication as Application, Cas1Assessment as Assessment } from '../@types/shared'
import { SummaryListActions, SummaryListItem, UiTask } from '../@types/ui'
import Apply from '../form-pages/apply'
import getSections from './assessments/getSections'
import isAssessment from './assessments/isAssessment'

const reviewSections = (
  applicationOrAssessment: Application | Assessment,
  rowFunction: (task: UiTask, document: Application | Assessment, showActions?: boolean) => Array<SummaryListItem>,
  showActions = true,
  cardActionFunction: (taskId: string) => SummaryListActions = undefined,
) => {
  const nonCheckYourAnswersSections = isAssessment(applicationOrAssessment)
    ? getSections(applicationOrAssessment).slice(0, -1)
    : Apply.sections.slice(0, -1)

  return nonCheckYourAnswersSections.map(section => {
    return {
      title: section.title,
      tasks: section.tasks.map(task => {
        return {
          card: {
            title: { text: task.title, headingLevel: 2 },
            actions: cardActionFunction ? cardActionFunction(task.id) : undefined,
            attributes: {
              'data-cy-section': task.id,
            },
          },
          rows: rowFunction(task, applicationOrAssessment, showActions),
        }
      }),
    }
  })
}

export default reviewSections
