/* eslint-disable import/no-extraneous-dependencies, no-console */
import { request } from '@playwright/test'
import { getToken } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/auth/get-token'
import { WorkflowPersonTier } from './workflow-person'

export type TierCalculationResult = {
  tierScore: string
  provisional: boolean
  calculationId: string
  calculationDate: string
}

// Expected tier calculated by NDelius/OASys may not be present immediately
const POLL_ATTEMPTS = 3
const POLL_INTERVAL_MS = 10_000

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const fetchLatestTier = async (crn: string): Promise<TierCalculationResult | null> => {
  const token = await getToken()
  const context = await request.newContext({ baseURL: process.env.TIER_API_URL })
  const response = await context.get(`/v3/crn/${crn}/tier`, {
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  })

  if (response.status() === 404) {
    return null
  }

  if (!response.ok()) {
    throw new Error(`Unexpected response from tier API: ${response.status()} ${await response.text()}`)
  }

  return response.json()
}

/**
 * Polls the tier API for the CRN's calculated tier so we verify the actual output
 * rather  than assuming our NDelius/OASys setup steps produced the requested
 * tier. Throws if the tier doesn't return the expected value wthin the window.
 */
export const verifyGeneratedTier = async (
  crn: string,
  expectedTier: WorkflowPersonTier,
): Promise<TierCalculationResult | null> => {
  let lastResult: TierCalculationResult | null = null
  const expectNoTier = expectedTier === 'MISSING' || expectedTier === 'NOT_SUPERVISED'

  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    lastResult = await fetchLatestTier(crn)

    if (expectNoTier && (lastResult === null || lastResult.tierScore == null)) {
      console.log(`Verified CRN ${crn} has no tier calculated, as expected for ${expectedTier}`)
      return lastResult
    }

    if (lastResult?.tierScore === expectedTier) {
      console.log(
        `Verified CRN ${crn} tier: ${lastResult.tierScore} (provisional: ${lastResult.provisional}) on attempt ${attempt}`,
      )
      return lastResult
    }

    console.log(
      `Attempt ${attempt}/${POLL_ATTEMPTS}: CRN ${crn} tier is ${lastResult?.tierScore ?? 'not yet calculated'}, waiting for ${expectedTier}...`,
    )
    // eslint-disable-next-line no-await-in-loop
    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error(
    `Tier verification failed for CRN ${crn}: expected ${expectedTier} but got ${JSON.stringify(lastResult)} after ${POLL_ATTEMPTS} attempts`,
  )
}
