import { AppealFormData } from '@approved-premises/ui'
import type { FieldDetails } from './new'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import Page from '../../../page'
import { summaryListItem } from '../../../../../server/utils/formUtils'
import { getAppealReasonText } from '../../../../../server/utils/placements/changeRequests'

export class ConfirmPage extends Page {
  constructor() {
    super('Confirm the appeal details')
  }

  checkSummary(formDetails: FieldDetails) {
    const appealReason: string = formDetails.appealReason.value
    const reasonDetailsKey = `${appealReason}Detail`
    const reasonText = getAppealReasonText({
      appealReason,
      [reasonDetailsKey]: formDetails[reasonDetailsKey].value,
    } as AppealFormData)

    this.shouldContainSummaryListItems([
      summaryListItem('Name of area manager', formDetails.areaManagerName.value),
      summaryListItem('Email address', formDetails.areaManagerEmail.value),
      summaryListItem('Date they approved', DateFormats.isoDateToUIDate(formDetails.approvalDate.value)),
      summaryListItem('Reason for appeal', reasonText, 'textBlock'),
      summaryListItem('Any other information', formDetails.notes.value, 'textBlock'),
    ])
  }
}
