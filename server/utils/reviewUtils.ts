import { ApprovedPremisesApplication as Application, ApprovedPremisesAssessment as Assessment } from '../@types/shared'
import { SummaryListItem, UiTask } from '../@types/ui'
import Apply from '../form-pages/apply'
import getSections from './assessments/getSections'
import isAssessment from './assessments/isAssessment'

const reviewSections = (
  applicationOrAssessment: Application | Assessment,
  rowFunction: (task: UiTask, document: Application | Assessment, showActions?: boolean) => Array<SummaryListItem>,
  showActions = true,
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
            title: { text: task.title, headingLevel: 3 },
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
