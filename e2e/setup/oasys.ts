/* eslint-disable import/no-extraneous-dependencies, no-console */
import { BrowserContext, expect, Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import {
  login as loginOasys,
  UserType,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/login.mjs'
import { clickCreateOffenderButton } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/cms-offender-details.mjs'
import { offenderSearchWithCRN } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/offender-search.mjs'
import { setProviderEstablishment } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/set-provider-establishment.mjs'
import { clickSearch } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/task-manager.mjs'
import { completeOffenceAnalysisYes } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/analysis-of-offences-layer3.mjs'
import { clickCMSRecord } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/cms-search-results.mjs'
import {
  clickOffenceAnalysis,
  clickRiskManagementPlan,
  clickRoSHScreeningSection1,
  clickSection1,
  clickSection2to13,
  selfAssessmentForm,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-assessment.mjs'
import {
  clickCreateAssessmentButton,
  clickUpdateOffenderButton,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-ofender.mjs'
import { clickOKForCRNAmendment } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/crn-amendment.mjs'
import { completeRoSHSection1MarkAllNo } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-1.mjs'
import { clickSection2To4RoshYes } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-2-4.mjs'
import { completeRoSHSection5FullAnalysis } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-5.mjs'
import { completeRoSHSection8FullAnalysisYes } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-8.mjs'
import { completeRoSHSection9RoSHSummary } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-layer3-assessment/section-9.mjs'
import { completeRoSHSection10RoSHSummary } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-10.mjs'
import { signAndlock } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/sign-and-lock.mjs'

type UseOasysSections = (sections: TestOptions['oasysSections']) => Promise<void>

const formatOasysDate = (date: Date) =>
  [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((part, index) => (index < 2 ? String(part).padStart(2, '0') : String(part)))
    .join('/')

const enterOasysDate = async (page: Page, selector: string, date: Date) => {
  const input = page.locator(selector)
  const formattedDate = formatOasysDate(date)

  await input.click()
  await input.press('ControlOrMeta+A')
  await input.press('Backspace')
  await input.pressSequentially(formattedDate)
  await input.press('Tab')
  await expect(input).toHaveValue(formattedDate)
}

const completeRequiredPredictorDates = async (page: Page, person: TestOptions['person']) => {
  const firstSanctionDate = new Date(person.details.dob)
  firstSanctionDate.setFullYear(firstSanctionDate.getFullYear() + 15)

  await page.getByRole('link', { name: 'Section 1', exact: true }).click()
  await page.getByRole('link', { name: 'Predictors', exact: true }).click()

  await page.getByLabel('Date of first sanction').click()
  await enterOasysDate(page, '#itm_1_8_2', firstSanctionDate)
  await page.getByLabel('Date of current conviction').click()
  await enterOasysDate(page, '#itm_1_29', person.convictionDate)
  await page.getByLabel('Date of most recent sanction involving a sexual/sexually motivated offence').click()
  await enterOasysDate(page, '#itm_1_33', person.convictionDate)

  await page.click('input[value="Next"]')
}

const completeRiskManagementPlan = async (page: Page) => {
  await page.locator('#textarea_RM28').fill('Currently in custody at HMP Moorland')
  await page.locator('#textarea_RM30').fill('Probation officer and prison offender manager')
  await page.locator('#textarea_RM31').fill('Test monitoring and control')
  await page.locator('#textarea_RM32').fill('Test interventions and treatment')
  await page.locator('#textarea_RM33').fill('Test victim safety planning')
  await page.locator('#textarea_RM34').fill('Test contingency plans')
  await page.locator('#textarea_RM35').fill('Test additional comments')
  await page.click('input[value="Save"]')

  // OASys can leave a resource request open after the page has rendered, so wait for the destination rather than "load".
  await page.click('input[value="Next"]', { noWaitAfter: true })
  await expect(page.locator('#contextleft > h3')).toHaveText('Summary Sheet (Layer 3)')
}

const selectWrappingOption = async (page: Page, id: string, option: string) => {
  await page.locator(`#${id}`).click()
  await page.locator(`#${id}-menu`).getByRole('option', { name: option, exact: true }).click()
}

const completeSentencePlan = async (page: Page) => {
  await page.getByRole('link', { name: 'Sentence Plan Service', exact: true }).click()
  await page.getByRole('button', { name: 'Open Sentence Plan Service' }).click()

  await page.locator('#confirm_privacy').check()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await page.getByRole('button', { name: 'Create goal' }).click()

  await page.locator('#area_of_need').check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await page.locator('#goal_title').fill('Find suitable accommodation')
  await page.locator('#is_related_to_other_areas-2').check()
  await page.locator('#can_start_now').check()
  await page.locator('#target_date_option').check()
  await page.getByRole('button', { name: 'Add Steps' }).click()

  await selectWrappingOption(page, 'step_actor_0', 'Probation practitioner')
  await page.locator('#step_description_0').fill('Support the person to find suitable accommodation')
  await selectWrappingOption(page, 'step_status_0', 'In progress')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('button', { name: 'Agree plan' }).click()
  await page.getByRole('radio', { name: 'Yes, I agree' }).check()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('button', { name: 'Return to OASys' }).click()
}

const createLayer3Assessment = async (page: Page, person: TestOptions['person']) => {
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

  const firstOffenceDate = new Date(person.details.dob)
  firstOffenceDate.setFullYear(firstOffenceDate.getFullYear() + 15)
  await clickSection1(page, firstOffenceDate)
  await completeRequiredPredictorDates(page, person)
  await clickSection2to13(page, 'Yes')
  await selfAssessmentForm(page)
  await clickRoSHScreeningSection1(page)
  await completeRoSHSection1MarkAllNo(page)
  await clickSection2To4RoshYes(page, person.details)
  await completeRoSHSection5FullAnalysis(page)
  await completeRoSHSection8FullAnalysisYes(page)
  await completeRoSHSection9RoSHSummary(page)
  await completeRoSHSection10RoSHSummary(page, true)
  await clickRiskManagementPlan(page)
  await completeRiskManagementPlan(page)
  await clickOffenceAnalysis(page)
  await completeOffenceAnalysisYes(page)
  await completeSentencePlan(page)
}

export const createOasysAssessment = async (
  context: BrowserContext,
  person: TestOptions['person'],
  use: UseOasysSections,
) => {
  const page = await context.newPage()

  try {
    console.log(`Creating OASys assessment for CRN ${person.crn}...`)
    await loginOasys(page, UserType.Booking)
    await createLayer3Assessment(page, person)
    await signAndlock(page)
    console.log(`Created and signed OASys assessment for CRN ${person.crn}`)
  } finally {
    await page.close()
  }

  await use([])
}
