/* eslint-disable import/no-extraneous-dependencies, no-console */
import { writeFileSync } from 'node:fs'
import { test } from '@playwright/test'
import { releasePrisoner } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api'
import { createOasysAssessment } from '../steps/oasys'
import { createTestPerson, isAssessedTier, PersonLifecycle } from '../setup/person'
import { verifyGeneratedTier } from '../setup/tier-verification'
import { WorkflowPersonGender, WorkflowPersonTier } from '../setup/workflow-person'

const outputFile = process.env.CRN_OUTPUT_FILE
const requestedTier = process.env.CAS1_E2E_PERSON_TIER as WorkflowPersonTier
const requestedGender = (process.env.CAS1_E2E_PERSON_GENDER || 'Male') as WorkflowPersonGender
const requestedDob = process.env.CAS1_E2E_PERSON_DOB || undefined
const validTiers: Array<WorkflowPersonTier> = ['A', 'B', 'C', 'D', 'MISSING', 'NOT_SUPERVISED']
const validGenders: Array<WorkflowPersonGender> = ['Male', 'Female']

test('generate one persistent person for requested tier', async ({ browser }) => {
  test.setTimeout(4 * 60 * 1000)

  if (!requestedTier) {
    test.skip(true, 'only run via setup-tier-data workflow')
  }
  if (!validTiers.includes(requestedTier)) {
    throw new Error('CAS1_E2E_PERSON_TIER must be one of: A, B, C, D, MISSING, NOT_SUPERVISED')
  }
  if (!validGenders.includes(requestedGender)) {
    throw new Error('CAS1_E2E_PERSON_GENDER must be one of: Male, Female')
  }
  if (requestedDob && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDob)) {
    throw new Error('CAS1_E2E_PERSON_DOB must be in YYYY-MM-DD format')
  }
  const dobOverride = requestedDob ? new Date(`${requestedDob}T00:00:00`) : undefined

  const context = await browser.newContext()
  const page = await context.newPage()
  const lifecycle: PersonLifecycle = { booked: false }

  try {
    const person = await createTestPerson(page, lifecycle, requestedTier, requestedGender, dobOverride)
    const result = {
      requestedTier,
      requestedGender,
      name: person.name,
      crn: person.crn,
      nomisId: person.nomisId,
      assessmentCreated: false,
      verifiedTier: null as string | null,
      provisional: null as boolean | null,
    }

    if (isAssessedTier(requestedTier)) {
      await createOasysAssessment(context, person, requestedTier)
      result.assessmentCreated = true
    }

    console.log(`Verifying calculated tier for CRN ${person.crn} matches requested tier ${requestedTier}...`)
    const verification = await verifyGeneratedTier(person.crn, requestedTier)
    result.verifiedTier = verification?.tierScore ?? null
    result.provisional = verification?.provisional ?? null

    if (outputFile) {
      writeFileSync(outputFile, JSON.stringify(result, null, 2))
    }

    console.log(`Generated person: ${JSON.stringify(result)}`)
  } catch (error) {
    if (lifecycle.booked && lifecycle.nomisId) {
      console.log(
        `Person generation failed; releasing prisoner ${lifecycle.nomisId}...`,
      )
      try {
        await releasePrisoner(lifecycle.nomisId)
        console.log(`Released prisoner ${lifecycle.nomisId}`)
      } catch (releaseError) {
        console.error(`Failed to release prisoner ${lifecycle.nomisId}:`, releaseError)
      }
    }
    throw error
  } finally {
    await context.close()
  }
})
