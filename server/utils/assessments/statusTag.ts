import { AssessmentDecision, ApprovedPremisesAssessmentStatus as AssessmentStatus } from '../../@types/shared'
import type { StatusTagOptions } from '../statusTag'
// eslint-disable-next-line import/no-cycle
import { StatusTag } from '../statusTag'

type AssessmentStatusesInUse = Extract<AssessmentStatus, 'not_started' | 'in_progress' | 'completed'>
export type AssessmentStatusForUi = Exclude<AssessmentStatusesInUse, 'completed'> | 'suitable' | 'rejected'

export class AssessmentStatusTag extends StatusTag<AssessmentStatusForUi> {
  static readonly statuses: Record<AssessmentStatusForUi, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    suitable: 'Suitable',
    rejected: 'Rejected',
  }

  static readonly colours: Record<AssessmentStatusForUi, string> = {
    not_started: 'grey',
    in_progress: 'blue',
    suitable: 'green',
    rejected: 'red',
  }

  constructor(status: AssessmentStatus, decision: AssessmentDecision, options?: StatusTagOptions) {
    let translatedStatus: AssessmentStatusForUi
    if (status === 'completed') {
      if (decision === 'accepted') {
        translatedStatus = 'suitable'
      } else {
        translatedStatus = 'rejected'
      }
    } else if (status === 'in_progress' || status === 'not_started') {
      translatedStatus = status
    }

    super(translatedStatus, options, {
      statuses: AssessmentStatusTag.statuses,
      colours: AssessmentStatusTag.colours,
    })
  }
}
