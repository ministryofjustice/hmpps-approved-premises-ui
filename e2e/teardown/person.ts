/* eslint-disable import/no-extraneous-dependencies, no-console */
import { expect, Page } from '@playwright/test'
import { deleteOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/delete-offender.mjs'
import { releasePrisoner } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api.mjs'
import { PersonLifecycle, loginDelius } from '../setup/person'

export const shouldKeepTestPerson = () => {
  return process.env.CAS1_E2E_KEEP_TEST_PERSON === 'true'
}

export const teardownTestPerson = async (page: Page, lifecycle: PersonLifecycle): Promise<Array<unknown>> => {
  if (shouldKeepTestPerson()) {
    return []
  }

  const cleanupErrors: Array<unknown> = []

  if (lifecycle.nomisId && lifecycle.booked) {
    try {
      console.log(`Releasing prisoner with NOMIS ID ${lifecycle.nomisId}...`)
      await releasePrisoner(lifecycle.nomisId)
      console.log(`Released prisoner with NOMIS ID ${lifecycle.nomisId}`)
    } catch (error) {
      console.error(`Could not release prisoner with NOMIS ID ${lifecycle.nomisId}`, error)
      cleanupErrors.push(error)
    }
  }

  if (lifecycle.crn) {
    try {
      console.log(`Deleting Delius offender with CRN ${lifecycle.crn}...`)
      await loginDelius(page)
      await deleteOffender(page, lifecycle.crn)
      await expect(page).toHaveTitle(/National Search/)
      await expect(page.getByText('No records found.')).toBeVisible()
      console.log(`Deleted Delius offender with CRN ${lifecycle.crn}`)
    } catch (error) {
      console.error(`Could not delete Delius offender with CRN ${lifecycle.crn}`, error)
      cleanupErrors.push(error)
    }
  }

  return cleanupErrors
}
