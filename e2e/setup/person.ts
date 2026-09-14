/* eslint-disable import/no-extraneous-dependencies, no-console */
import { expect, Page } from '@playwright/test'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createCustodialEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import { createRegistration } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/registration/create-registration'
import { createRelease } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/release/create-release'
import { createAndBookPrisoner } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api'
import { findOffenderByCRN } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/find-offender'
import { selectOption } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/inputs'
import { doUntil } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/refresh'
import { WorkflowPerson, WorkflowPersonGender, WorkflowPersonTier } from './workflow-person'

export type PersonLifecycle = {
  crn?: string
  nomisId?: string
  booked: boolean
}

const TEST_TEAM = {
  name: 'Community Accommodation Test Team',
  provider: 'London',
}

const DEFAULT_DOB = new Date(1975, 0, 1)

const SA_EVENT = {
  appearanceType: 'Sentence',
  outcome: 'Adult Custody < 12m',
  length: '6',
  mainOffence: 'Rape - 01900',
  subOffence: 'Rape of a female aged 16 or over - 01908',
  plea: 'Guilty',
}

const INDECENT_EXPOSURE_EVENT = {
  appearanceType: 'Sentence',
  outcome: 'Adult Custody < 12m',
  length: '6',
  mainOffence: 'Indecent exposure with intent to insult any female - 13900',
  plea: 'Guilty',
}

const ABUSE_OF_TRUST_EVENT = {
  appearanceType: 'Sentence',
  outcome: 'Adult Custody < 12m',
  length: '6',
  mainOffence: 'Abuse of Trust - Sexual Offences - 07300',
  plea: 'Guilty',
}

export type AssessedTier = 'A' | 'B' | 'C' | 'D'

// Business rules for determining V3 tiers defined here https://dsdmoj.atlassian.net/wiki/spaces/PINT/pages/6105498753/Tiering+V3+-+Business+Rules
type TierRule = {
  rosh: 'Very High RoSH' | 'High RoSH' | 'Medium RoSH' | 'Low RoSH'
  mappa: boolean
  extra?: 'lifer-recent-release'
  dob?: Date
  event: {
    appearanceType?: string
    outcome?: string
    length?: string
    mainOffence?: string
    subOffence?: string
    plea?: string
  }
}

const TIER_RULES: Record<AssessedTier, TierRule> = {
  A: { rosh: 'Very High RoSH', mappa: true, event: SA_EVENT },
  B: { rosh: 'Low RoSH', mappa: false, extra: 'lifer-recent-release', event: INDECENT_EXPOSURE_EVENT },
  C: { rosh: 'High RoSH', mappa: true, event: INDECENT_EXPOSURE_EVENT },
  D: { rosh: 'Medium RoSH', mappa: true, dob: new Date(1958, 0, 1), event: ABUSE_OF_TRUST_EVENT },
}

const createRegistrationForTestProvider = async (
  page: Page,
  crn: string,
  registrationType: string,
  category?: string,
  level?: string,
) => {
  await findOffenderByCRN(page, crn)
  await page.locator('a', { hasText: 'Personal Details' }).click()
  await page.locator('a', { hasText: 'Registration Summary' }).click()
  await expect(page).toHaveTitle('Register Summary')
  await page.locator('input', { hasText: 'Add Registration' }).click()
  await expect(page).toHaveTitle('Add Registration')
  await selectOption(page, '#Trust\\:selectOneMenu', TEST_TEAM.provider)
  await selectOption(page, '#RegisterType\\:selectOneMenu', registrationType)
  if (category) {
    await selectOption(page, '#Category\\:selectOneMenu', category)
  }
  if (level) {
    await selectOption(page, '#Level\\:selectOneMenu', level)
  }
  await selectOption(page, '#Team\\:selectOneMenu')
  await selectOption(page, '#Staff\\:selectOneMenu')

  const saveButton = page.locator('input', { hasText: 'Save' })
  await doUntil(
    () => saveButton.click(),
    () => expect(page.locator('tbody tr', { hasText: registrationType })).toBeVisible(),
  )
}

export const loginDelius = async (page: Page) => {
  await page.goto(process.env.DELIUS_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })

  const homePageTitle = 'National Delius Home Page'
  if ((await page.title()) === homePageTitle) {
    return
  }

  await expect(page).toHaveTitle(/National Delius - Login/)
  await page.fill('#j_username', process.env.DELIUS_USERNAME)
  await page.fill('#j_password', process.env.DELIUS_PASSWORD)
  await page.locator('.btn-primary', { hasText: 'Login' }).click({ noWaitAfter: true })
  await expect(page).toHaveTitle(homePageTitle, { timeout: 60_000 })
}

const assessedTiers: Array<AssessedTier> = ['A', 'B', 'C', 'D']
export const isAssessedTier = (tier: WorkflowPersonTier): tier is AssessedTier =>
  assessedTiers.includes(tier as AssessedTier)

export const createTierRegistration = async (page: Page, crn: string, tier: AssessedTier) => {
  const rule = TIER_RULES[tier]

  if (rule.mappa) {
    await createRegistration(page, crn, 'MAPPA', TEST_TEAM.provider)
  }

  if (rule.extra === 'lifer-recent-release') {
    await createRegistrationForTestProvider(page, crn, 'Lifer', 'Lifer - Life Imprisonment', 'Lifer - Supervised')
    await createRelease(page, crn)
  }

  await createRegistrationForTestProvider(page, crn, rule.rosh)
}

export const createTestPerson = async (
  page: Page,
  lifecycle: PersonLifecycle,
  tier: WorkflowPersonTier,
  gender: WorkflowPersonGender = 'Male',
  dobOverride?: Date,
): Promise<WorkflowPerson> => {
  await loginDelius(page)

  const dob = dobOverride ?? ((isAssessedTier(tier) && TIER_RULES[tier].dob) || DEFAULT_DOB)
  const person = deliusPerson({ sex: gender, dob })
  const convictionDate = new Date()
  convictionDate.setDate(convictionDate.getDate() - 1)
  convictionDate.setHours(12, 0, 0, 0)

  console.log(`Creating Delius offender for ${person.firstName} ${person.lastName}...`)
  lifecycle.crn = await createOffender(page, { person, providerName: TEST_TEAM.provider })
  console.log(`Created Delius offender with CRN ${lifecycle.crn}`)
  console.log(`Tier: ${tier}`)

  if (tier !== 'NOT_SUPERVISED') {
    console.log(`Creating custodial event for CRN ${lifecycle.crn}...`)
    await createCustodialEvent(page, {
      crn: lifecycle.crn,
      allocation: { team: TEST_TEAM },
      event: isAssessedTier(tier) ? TIER_RULES[tier].event : SA_EVENT,
      date: convictionDate,
    })
    console.log(`Created custodial event for CRN ${lifecycle.crn}`)
  }

  if (isAssessedTier(tier)) {
    console.log(`Creating Tier ${tier} registration for CRN ${lifecycle.crn}...`)
    await createTierRegistration(page, lifecycle.crn, tier)
    console.log(`Created Tier ${tier} registration for CRN ${lifecycle.crn}`)
  }

  console.log(`Creating and booking prisoner for CRN ${lifecycle.crn} at SWI...`)
  const { nomisId, bookingId } = await createAndBookPrisoner(page, lifecycle.crn, person)
  lifecycle.nomisId = nomisId
  lifecycle.booked = true
  console.log(`Created and booked prisoner ${lifecycle.nomisId} with booking ID ${bookingId}`)

  return {
    crn: lifecycle.crn,
    name: `${person.firstName} ${person.lastName}`,
    details: {
      ...person,
      gender,
    },
    nomisId: lifecycle.nomisId,
    convictionDate,
  }
}
