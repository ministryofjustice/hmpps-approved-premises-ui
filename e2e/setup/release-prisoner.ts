import { request } from '@playwright/test'
import { getToken } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/auth/get-token'

/**
 * Releases a prisoner from custody, optionally on a specific date.
 *
 * Mirrors the upstream `releasePrisoner` helper from
 * `@ministryofjustice/hmpps-probation-integration-e2e-tests`, which only supports releasing
 * "yesterday" at midday. This local variant accepts an optional `releaseDate` (YYYY-MM-DD) so
 * the workflow can request a specific release date; when omitted it falls back to the same
 * default (yesterday at midday) as the upstream helper.
 */
export const releasePrisonerOnDate = async (offenderNo: string, releaseDate?: Date): Promise<void> => {
  const releaseDateTime = releaseDate ?? new Date(Date.now() - 24 * 60 * 60 * 1000)
  releaseDateTime.setHours(12, 0, 0, 0)
  const releaseTime = releaseDateTime.toISOString().slice(0, 19)

  const token = await getToken()
  const context = await request.newContext({ baseURL: process.env.PRISON_API })

  await context.put(`/api/offenders/${offenderNo}/release`, {
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: true,
    data: {
      movementReasonCode: 'CR',
      releaseTime,
    },
  })
}
