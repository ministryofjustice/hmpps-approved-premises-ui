/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, expect, Page, request } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender.mjs'
import { deleteOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/delete-offender.mjs'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person.mjs'
import { createCustodialEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event.mjs'
import {
  createPrisoner,
  releasePrisoner,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api.mjs'
import { getToken } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/auth/get-token.mjs'
import { setNomisId } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/update-offender.mjs'

type UsePerson = (person: TestOptions['person']) => Promise<void>

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

const loginDelius = async (page: Page) => {
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

const bookPrisoner = async (nomisId: string): Promise<number> => {
  const token = await getToken()
  const api = await request.newContext({
    baseURL: process.env.PRISON_API,
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  try {
    const caseLoadsResponse = await api.get('/api/users/me/caseLoads?allCaseloads=true', {
      failOnStatusCode: true,
    })
    const caseLoads: unknown = await caseLoadsResponse.json()
    if (!Array.isArray(caseLoads)) {
      throw new Error('Prison API did not return NOMIS proxy user caseloads')
    }
    const accessiblePrisonIds = caseLoads
      .flatMap(caseLoad => {
        if (
          typeof caseLoad === 'object' &&
          caseLoad !== null &&
          'type' in caseLoad &&
          caseLoad.type === 'INST' &&
          'caseLoadId' in caseLoad &&
          typeof caseLoad.caseLoadId === 'string'
        ) {
          return [
            { id: caseLoad.caseLoadId, active: 'currentlyActive' in caseLoad && caseLoad.currentlyActive === true },
          ]
        }
        return []
      })
      .sort((left, right) => Number(right.active) - Number(left.active))
      .map(caseLoad => caseLoad.id)
    const prisonIds = process.env.CAS1_E2E_PRISON_ID ? [process.env.CAS1_E2E_PRISON_ID] : accessiblePrisonIds

    if (!prisonIds.length) {
      throw new Error('The NOMIS proxy user has no accessible prison caseloads')
    }

    for (const prisonId of prisonIds) {
      // Booking attempts must be sequential to avoid creating multiple active bookings for one prisoner.
      // eslint-disable-next-line no-await-in-loop
      const response = await api.post(`/api/offenders/${nomisId}/booking`, {
        data: {
          movementReasonCode: 'N',
          prisonId,
          imprisonmentStatus: 'SENT03',
        },
      })
      // eslint-disable-next-line no-await-in-loop
      const responseBody = await response.text()

      if (response.ok()) {
        const booking = JSON.parse(responseBody) as { bookingId?: unknown }
        if (typeof booking.bookingId !== 'number') {
          throw new Error(`Prison API did not return a booking ID for ${nomisId}`)
        }
        return booking.bookingId
      }

      const isCapacityConflict = response.status() === 409 && responseBody.includes('"errorCode":30001')
      if (!isCapacityConflict) {
        throw new Error(
          `Could not book ${nomisId} at ${prisonId}: Prison API returned ${response.status()} ${responseBody}`,
        )
      }
    }

    throw new Error(`Could not book ${nomisId}: no reception capacity at ${prisonIds.join(', ')}`)
  } finally {
    await api.dispose()
  }
}

export const useTestPerson = async (context: BrowserContext, use: UsePerson) => {
  const page = await context.newPage()
  let crn: string | undefined
  let nomisId: string | undefined
  let booked = false
  let lifecycleError: unknown

  try {
    await loginDelius(page)

    const person = deliusPerson()
    const convictionDate = new Date()
    convictionDate.setDate(convictionDate.getDate() - 1)
    convictionDate.setHours(12, 0, 0, 0)

    crn = await createOffender(page, { person, providerName: TEST_TEAM.provider })
    await createCustodialEvent(page, {
      crn,
      allocation: { team: TEST_TEAM },
      event: TEST_EVENT,
      date: convictionDate,
    })

    nomisId = await createPrisoner(person)
    await setNomisId(page, crn, nomisId)
    await bookPrisoner(nomisId)
    booked = true

    await use({
      crn,
      name: `${person.firstName} ${person.lastName}`,
      details: person,
      nomisId,
      convictionDate,
    })
  } catch (error) {
    lifecycleError = error
  }

  const cleanupErrors: Array<unknown> = []

  if (nomisId && booked) {
    try {
      await releasePrisoner(nomisId)
    } catch (error) {
      cleanupErrors.push(error)
    }
  }

  if (crn) {
    try {
      await loginDelius(page)
      await deleteOffender(page, crn)
    } catch (error) {
      cleanupErrors.push(error)
    }
  }

  await page.close()

  if (cleanupErrors.length) {
    const messages = cleanupErrors.map(error => (error instanceof Error ? error.message : String(error)))
    if (lifecycleError instanceof Error) {
      lifecycleError.message = `${lifecycleError.message}; cleanup also failed: ${messages.join('; ')}`
      throw lifecycleError
    }
    if (lifecycleError) {
      throw new Error(`${String(lifecycleError)}; cleanup also failed: ${messages.join('; ')}`)
    }
    throw new Error(`Could not clean up E2E person data: ${messages.join('; ')}`)
  }

  if (lifecycleError) {
    throw lifecycleError
  }
}
