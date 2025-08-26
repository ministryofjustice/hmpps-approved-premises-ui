import { AppealFormData } from '@approved-premises/ui'
import Page from '../../../page'
import { summaryListItem } from '../../../../../server/utils/formUtils'
import { getAppealReasonText } from '../../../../../server/utils/placements/changeRequests'
import type { FieldDetails } from '../../../formPage'

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
      summaryListItem('Date they approved', formDetails.approvalDate.value, 'date'),
      summaryListItem('Reason for appeal', reasonText, 'textBlock'),
      summaryListItem('Any other information', formDetails.notes.value, 'textBlock'),
    ])
  }
}
