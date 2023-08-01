import { differenceInDays } from 'date-fns'
import {
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  Document,
} from '@approved-premises/api'
import { BedOccupancyEntryUiType } from '@approved-premises/ui'
import { bedOccupancyEntryBookingUiFactory } from '../../server/testutils/factories'
import {
  bedOccupancyEntryLostBedUiFactory,
  bedOccupancyEntryOpenUiFactory,
} from '../../server/testutils/factories/bedOccupancyRange'
import { DateFormats } from '../../server/utils/dateUtils'

const documentsFromApplication = (application: ApprovedPremisesApplication): Array<Document> => {
  return application.data['attach-required-documents']['attach-documents'].selectedDocuments as Array<Document>
}

const roshSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['offence-details']
    .offenceDetailsSummaries as ArrayOfOASysOffenceDetailsQuestions
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysSupportingInformationQuestions => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysSupportingInformationQuestions
}

const riskManagementPlanFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskManagementPlanQuestions => {
  return application.data['oasys-import']['risk-management-plan']
    .riskManagementSummaries as ArrayOfOASysRiskManagementPlanQuestions
}

const riskToSelfSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskToSelfQuestions => {
  return application.data['oasys-import']['risk-to-self'].riskToSelfSummaries as ArrayOfOASysRiskToSelfQuestions
}

const createOccupancyEntry = (startDate: Date, endDate: Date, type: BedOccupancyEntryUiType) => {
  const factory = {
    booking: bedOccupancyEntryBookingUiFactory,
    lost_bed: bedOccupancyEntryLostBedUiFactory,
    open: bedOccupancyEntryOpenUiFactory,
  }[type]

  return factory.build({
    type,
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    length: differenceInDays(endDate, startDate) + 1,
  })
}

export {
  documentsFromApplication,
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  createOccupancyEntry,
}
