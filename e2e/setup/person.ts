/* eslint-disable import/no-extraneous-dependencies, no-console */
import { expect, Page } from '@playwright/test'
import { PersonTier, TestOptions } from '@approved-premises/e2e'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender.mjs'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person.mjs'
import { createCustodialEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event.mjs'
import { createRegistration } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/registration/create-registration.mjs'
import { createRelease } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/release/create-release.mjs'
import { createAndBookPrisoner } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api.mjs'
import { findOffenderByCRN } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/find-offender.mjs'
import { selectOption } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/inputs.mjs'
import { doUntil } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/refresh.mjs'

export type PersonLifecycle = {
  crn?: string
  nomisId?: string
  booked: boolean
}

const TEST_TEAM = {
  name: 'Community Accommodation Test Team',
  provider: 'London',
}

const TEST_EVENT = {
  appearanceType: 'Sentence',
  outcome: 'Adult Custody < 12m',
  length: '6',
  mainOffence: 'Rape - 01900',
  subOffence: 'Rape of a female aged 16 or over - 01908',
  plea: 'Guilty',
}

const LOW_RISK_TEST_EVENT = {
  appearanceType: 'Sentence',
  outcome: 'Adult Custody < 12m',
  length: '6',
  mainOffence: 'Stealing by an employee - 04100',
  plea: 'Guilty',
}

const ROSH_REGISTRATION_BY_TIER = {
  // V3 takes the highest applicable rule. These RoSH levels combine with MAPPA for A, C and D.
  A: 'Very High RoSH',
  B: 'Low RoSH',
  C: 'High RoSH',
  D: 'Medium RoSH',
  E: 'Low RoSH',
} as const

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

export const createTierRegistration = async (
  page: Page,
  crn: string,
  tier: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
) => {
  if (tier === 'A' || tier === 'C' || tier === 'D' || tier === 'E') {
    await createRegistration(page, crn, 'MAPPA', TEST_TEAM.provider)
  } else if (tier === 'B') {
    await createRegistrationForTestProvider(page, crn, 'Lifer', 'Lifer - Life Imprisonment', 'Lifer - Supervised')
  } else if (tier === 'F') {
    await createRegistrationForTestProvider(page, crn, 'Stalking')
  }

  if (tier !== 'F' && tier !== 'G') {
    await createRegistrationForTestProvider(page, crn, ROSH_REGISTRATION_BY_TIER[tier])
  }
}

export const createTestPerson = async (
  page: Page,
  lifecycle: PersonLifecycle,
  tier: PersonTier,
  sex: 'Male' | 'Female' = 'Male',
): Promise<TestOptions['person']> => {
  await loginDelius(page)

  const person = deliusPerson({ sex })
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
      event: tier === 'A' ? TEST_EVENT : LOW_RISK_TEST_EVENT,
      date: convictionDate,
    })
    console.log(`Created custodial event for CRN ${lifecycle.crn}`)
  }

  if (tier === 'A' || tier === 'B' || tier === 'C' || tier === 'D' || tier === 'E' || tier === 'F' || tier === 'G') {
    console.log(`Creating Tier ${tier} registration for CRN ${lifecycle.crn}...`)
    await createTierRegistration(page, lifecycle.crn, tier)
    console.log(`Created Tier ${tier} registration for CRN ${lifecycle.crn}`)

    if (tier === 'B') {
      console.log(`Creating recent release for Tier B CRN ${lifecycle.crn}...`)
      await createRelease(page, lifecycle.crn)
      console.log(`Created recent release for Tier B CRN ${lifecycle.crn}`)
    }
  }

  console.log(`Creating and booking prisoner for CRN ${lifecycle.crn} at SWI...`)
  const { nomisId, bookingId } = await createAndBookPrisoner(page, lifecycle.crn, person)
  lifecycle.nomisId = nomisId
  lifecycle.booked = true
  console.log(`Created and booked prisoner ${lifecycle.nomisId} with booking ID ${bookingId}`)

  return {
    crn: lifecycle.crn,
    name: `${person.firstName} ${person.lastName}`,
    details: person,
    nomisId: lifecycle.nomisId,
    convictionDate,
  }
}
