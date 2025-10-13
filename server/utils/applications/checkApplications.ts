import { ApprovedPremisesApplicationStatus, Cas1ApplicationSummary } from '@approved-premises/api'
import paths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'
import { DateFormats } from '../dateUtils'
import { ApplicationStatusTag } from './statusTag'
import { linkTo } from '../utils'

export const statusesLimitedToOne: Array<ApprovedPremisesApplicationStatus> = [
  'started',
  'awaitingAssesment',
  'unallocatedAssesment',
  'assesmentInProgress',
  'awaitingPlacement',
  'placementAllocated',
  'requestedFurtherInformation',
  'pendingPlacementRequest',
]
export const placementRequestAllowed: Array<ApprovedPremisesApplicationStatus> = [
  'awaitingPlacement',
  'placementAllocated',
  'pendingPlacementRequest',
]

const textRow = (value: string) => ({ text: value })
const htmlRow = (value: string) => ({ html: value })

export const getApplicationTableRows = (applicationList: Array<Cas1ApplicationSummary>) => {
  return applicationList.map(({ person, id, createdAt, submittedAt, status, hasRequestsForPlacement }) => {
    const links:Array<string> = []
    if(applicationList.length === 1 && placementRequestAllowed.includes(applicationList[0].status)) links.push(
      linkTo(placementApplicationPaths.placementApplications.create({}), {
        text: 'Create placement request',
        query: { id },
      })
    )
    links.push(hasRequestsForPlacement
      ? `<a href="${paths.applications.withdraw.new({ id })}">Expire</a>`
      : `<a href="${paths.applications.withdraw.new({ id })}">Withdraw</a>`)


    return [
      htmlRow(`<a href="${paths.applications.show({ id })}">${person.crn}</a>`),
      textRow(DateFormats.isoDateToUIDate(createdAt)),
      textRow((submittedAt && DateFormats.isoDateToUIDate(submittedAt)) || ''),
      htmlRow(new ApplicationStatusTag(status).html()),
      htmlRow(links.join('<br/>')),
    ]
  })
}

export const getApplicationTableHeader = () => [
  textRow('CRN'),
  textRow('Created'),
  textRow('Submitted'),
  textRow('Status'),
  textRow(''),
]
