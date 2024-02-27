import { differenceInDays } from 'date-fns'
import {
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  Document,
  Withdrawable,
} from '@approved-premises/api'
import { BedOccupancyEntryUiType } from '@approved-premises/ui'
import { bedOccupancyEntryBookingUiFactory } from '../../server/testutils/factories'
import {
  bedOccupancyEntryLostBedUiFactory,
  bedOccupancyEntryOpenUiFactory,
} from '../../server/testutils/factories/bedOccupancyRange'
import { DateFormats } from '../../server/utils/dateUtils'
import NewWithdrawalPage from '../pages/apply/newWithdrawal'
import PlacementApplicationWithdrawalConfirmationPage from '../pages/match/placementApplicationWithdrawalConfirmationPage'
import ShowPagePlacementApplications from '../pages/admin/placementApplications/showPage'
import { ShowPage as ShowPageApply } from '../pages/apply'
import Page from '../pages/page'

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

const withdrawPlacementRequestOrApplication = async (
  withdrawable: Withdrawable,
  showPage: ShowPagePlacementApplications | ShowPageApply,
) => {
  // Then I should see the withdrawable type selection page
  const selectWithdrawableTypePage = new NewWithdrawalPage('What do you want to withdraw?')
  // And be able to select Placement Request
  selectWithdrawableTypePage.selectType('placementRequest')
  selectWithdrawableTypePage.clickSubmit()

  // Then I should see the withdrawable selection page
  const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
  // And be able to select a placement
  selectWithdrawablePage.selectWithdrawable(withdrawable.id)
  selectWithdrawablePage.clickSubmit()

  // Then I should see the withdrawal confirmation page
  const confirmationPage = Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)
  // And be able to state a reason
  const withdrawalReason = 'DuplicatePlacementRequest'
  confirmationPage.selectReason(withdrawalReason)
  confirmationPage.clickConfirm()

  // And I should see the confirmation message
  showPage.shouldShowBanner('Request for placement')
}

export {
  documentsFromApplication,
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  createOccupancyEntry,
  withdrawPlacementRequestOrApplication,
}
