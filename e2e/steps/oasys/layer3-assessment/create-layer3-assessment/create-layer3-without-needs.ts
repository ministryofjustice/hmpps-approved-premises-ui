/* eslint-disable import/no-extraneous-dependencies */
import { expect, Page } from '@playwright/test'
import { PersonTier, TestOptions } from '@approved-premises/e2e'
import { clickCreateOffenderButton } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/cms-offender-details.mjs'
import { offenderSearchWithCRN } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/offender-search.mjs'
import { setProviderEstablishment } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/set-provider-establishment.mjs'
import { clickSearch } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/task-manager.mjs'
import { completeOffenceAnalysisYes } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/analysis-of-offences-layer3.mjs'
import { clickCMSRecord } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/cms-search-results.mjs'
import {
  clickOffenceAnalysis,
  clickRiskManagementPlan,
  clickRoSHSummary,
  clickRoSHScreeningSection1,
  clickSection2to13,
  selfAssessmentForm,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-assessment.mjs'
import {
  clickCreateAssessmentButton,
  clickUpdateOffenderButton,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-ofender.mjs'
import { clickOKForCRNAmendment } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/crn-amendment.mjs'
import { completeRoSHSection1MarkAllNo } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-1.mjs'
import { completeRoSHSection5FullAnalysis } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-5.mjs'
import { completeRoSHSection8FullAnalysisYes } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-8.mjs'
import { completeOffenderInformationLayer3 } from '../offender-information-layer3'
import { completeRiskManagementPlan } from '../risk-management-plan'
import { completeRoSHSection9RoSHSummary } from '../section-9'
import { completeRoSHSection10RoSHSummary } from '../section-10'
import { clickSection2To4ForTier } from '../section-2-4'
import { completeReviewSentencePlan } from './review-sentenceplan'

type OasysTier = Extract<PersonTier, 'A' | 'B' | 'C'>

export const createLayer3AssessmentWithoutNeeds = async (
  page: Page,
  person: TestOptions['person'],
  tier: OasysTier,
) => {
  const providerHeading = page.locator('#loginbodyheader > h2')
  if ((await providerHeading.isVisible()) && (await providerHeading.innerText()) === 'Provider/Establishment') {
    await setProviderEstablishment(page)
  }

  await clickSearch(page)
  await offenderSearchWithCRN(page, person.crn)
  await clickCreateOffenderButton(page)
  await page.locator('#P10_CMS_PRIS_NUMBER').fill(person.nomisId)
  await page.locator('#B2777914628851790', { hasText: 'Save' }).click()
  await clickCreateAssessmentButton(page)
  await clickOKForCRNAmendment(page)
  await clickCMSRecord(page)
  await clickUpdateOffenderButton(page)

  await page.locator('#P10_PURPOSE_ASSESSMENT_ELM').selectOption({ label: 'Start custody' })
  await expect(page.locator('#P10_ASSESSMENT_TYPE_ELM')).toContainText('Full (Layer 3)')
  await page.getByLabel('Include strengths and needs sections?').selectOption('N')
  await page.locator('#B3730320750239994').click()

  const cmsWarningButton = page.locator('#P12_BT_OK')
  if (await cmsWarningButton.isVisible()) {
    await cmsWarningButton.click()
  }

  await expect(page.locator('#contextleft > h3')).toHaveText('Case ID - Offender Information (Layer 3)')

  await completeOffenderInformationLayer3(page, person)
  await clickSection2to13(page, 'Yes')
  await selfAssessmentForm(page)
  await clickRoSHScreeningSection1(page)
  await completeRoSHSection1MarkAllNo(page)
  await clickSection2To4ForTier(page, person.details, tier)
  await completeRoSHSection5FullAnalysis(page)
  if (tier === 'A' || tier === 'B') {
    await completeRoSHSection8FullAnalysisYes(page)
  } else {
    await clickRoSHSummary(page)
  }
  await completeRoSHSection9RoSHSummary(page)
  await completeRoSHSection10RoSHSummary(page, tier)
  await clickRiskManagementPlan(page)
  await completeRiskManagementPlan(page)
  await completeReviewSentencePlan(page)
  await clickOffenceAnalysis(page)
  await completeOffenceAnalysisYes(page)
}
