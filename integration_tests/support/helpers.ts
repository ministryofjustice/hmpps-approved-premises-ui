import { Withdrawable } from '@approved-premises/api'
import NewWithdrawalPage from '../pages/apply/newWithdrawal'
import PlacementApplicationWithdrawalConfirmationPage from '../pages/match/placementApplicationWithdrawalConfirmationPage'
import ShowPagePlacementApplications from '../pages/admin/placementApplications/showPage'
import { ShowPage as ShowPageApply } from '../pages/apply'
import Page from '../pages/page'
import paths from '../../server/paths/apply'

const withdrawPlacementRequestOrApplication = async (
  withdrawable: Withdrawable,
  showPage: ShowPagePlacementApplications | ShowPageApply,
  applicationId: string,
) => {
  const withdrawableName = withdrawable.type === 'space_booking' ? 'placement' : 'request'

  // Then I should see the withdrawable type selection page
  const selectWithdrawableTypePage = new NewWithdrawalPage('What do you want to withdraw?')
  // And be able to select Placement Request
  selectWithdrawableTypePage.selectType('placementRequest')
  selectWithdrawableTypePage.clickSubmit()

  // Then I should see the withdrawable selection page
  const selectWithdrawablePage = new NewWithdrawalPage(`Select your ${withdrawableName}`)
  selectWithdrawablePage.shouldShowWithdrawableGuidance(withdrawableName)
  // And be able to select a placement
  selectWithdrawablePage.selectWithdrawable(withdrawable.id)
  selectWithdrawablePage.clickSubmit()

  // Then I should see the withdrawal confirmation page
  const confirmationPage = Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)
  confirmationPage.checkForBackButton(
    `${paths.applications.withdraw.new({ id: applicationId })}?selectedWithdrawableType=placementRequest`,
  )
  // And be able to state a reason
  const withdrawalReason = 'DuplicatePlacementRequest'
  confirmationPage.selectReason(withdrawalReason)
  confirmationPage.clickConfirm()

  // And I should see the confirmation message
  showPage.shouldShowBanner('Request for placement for ', { exact: false })
}

export { withdrawPlacementRequestOrApplication }
