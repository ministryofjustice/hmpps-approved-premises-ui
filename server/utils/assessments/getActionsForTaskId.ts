import { SummaryListActionItem } from '@approved-premises/ui'

import paths from '../../paths/assess'

export const getActionsForTaskId = (taskId: string, applicationOrAssessmentId: string) => {
  const actions = { items: [] as Array<SummaryListActionItem> }

  if (taskId === 'oasys-import') {
    actions.items.push({
      href: paths.assessments.supportingInformationPath({
        id: applicationOrAssessmentId,
        category: 'risk-information',
      }),
      text: 'View detailed risk information',
    })
  }

  if (taskId === 'prison-information') {
    actions.items.push({
      href: paths.assessments.supportingInformationPath({
        id: applicationOrAssessmentId,
        category: 'prison-information',
      }),
      text: 'View additional prison information',
    })
  }

  return actions
}
