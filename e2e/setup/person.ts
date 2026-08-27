/* eslint-disable import/no-extraneous-dependencies, no-console */
import { expect, Page } from '@playwright/test'
import { PersonTier, TestOptions } from '@approved-premises/e2e'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender.mjs'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person.mjs'
import { createCustodialEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event.mjs'
import { createRegistration } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/registration/create-registration.mjs'
import { createAndBookPrisoner } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api.mjs'

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

export const createTestPerson = async (
  page: Page,
  lifecycle: PersonLifecycle,
  tier: PersonTier,
): Promise<TestOptions['person']> => {
  await loginDelius(page)

  const person = deliusPerson({ sex: 'Male' })
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
      event: TEST_EVENT,
      date: convictionDate,
    })
    console.log(`Created custodial event for CRN ${lifecycle.crn}`)
  }

  if (tier === 'A') {
    console.log(`Creating Tier A registrations for CRN ${lifecycle.crn}...`)
    await createRegistration(page, lifecycle.crn, 'MAPPA', TEST_TEAM.provider)
    console.log(`Created Tier A registrations for CRN ${lifecycle.crn}`)
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
