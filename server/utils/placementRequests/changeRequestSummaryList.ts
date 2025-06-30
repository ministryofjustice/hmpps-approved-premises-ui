import { Cas1ChangeRequest } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { DateFormats } from '../dateUtils'
import { summaryListItem } from '../formUtils'
import { getAppealReasonText } from '../placements/changeRequests'

export const changeRequestSummaryList = (changeRequest: Cas1ChangeRequest): SummaryList => {
  const { createdAt, requestJson } = changeRequest
  const { areaManagerName, areaManagerEmail, approvalDate, notes } = requestJson
  const rows: Array<SummaryListItem> = [
    summaryListItem('Approving area manager', `${areaManagerName}\n${areaManagerEmail}`, 'textBlock'),
    summaryListItem('Date approval given', DateFormats.isoDateToUIDate(approvalDate)),
    summaryListItem('Reason for appeal', getAppealReasonText(requestJson), 'textBlock'),
    summaryListItem('Anything else', notes, 'textBlock'),
    summaryListItem('Date of request', DateFormats.isoDateToUIDate(createdAt)),
  ]
  return { rows }
}
