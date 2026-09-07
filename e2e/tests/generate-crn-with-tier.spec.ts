/* eslint-disable no-console */
import { writeFileSync } from 'node:fs'
import { test } from '@playwright/test'
import { createOasysAssessment } from '../steps/oasys'
import { createTestPerson, PersonLifecycle } from '../setup/person'
import { WorkflowPersonTier } from '../setup/workflow-person'

const outputFile = process.env.CRN_OUTPUT_FILE
const requestedTier = process.env.CAS1_E2E_PERSON_TIER as WorkflowPersonTier
const validTiers: Array<WorkflowPersonTier> = ['A', 'B', 'C', 'MISSING', 'NOT_SUPERVISED']
const assessedTiers: Array<WorkflowPersonTier> = ['A', 'B', 'C']

test('generate one persistent person for requested tier', async ({ browser }) => {
  test.setTimeout(30 * 60 * 1000)

  if (!validTiers.includes(requestedTier)) {
    throw new Error('CAS1_E2E_PERSON_TIER must be one of: A, B, C, MISSING, NOT_SUPERVISED')
  }

  const context = await browser.newContext()
  const page = await context.newPage()
  const lifecycle: PersonLifecycle = { booked: false }
  const person = await createTestPerson(page, lifecycle, requestedTier)
  const result = { requestedTier, crn: person.crn, nomisId: person.nomisId, assessmentCreated: false }

  if (assessedTiers.includes(requestedTier)) {
    await createOasysAssessment(context, person, requestedTier)
    result.assessmentCreated = true
  }

  if (outputFile) {
    writeFileSync(outputFile, JSON.stringify(result, null, 2))
  }

  console.log(`Generated person: ${JSON.stringify(result)}`)
  await context.close()
})
