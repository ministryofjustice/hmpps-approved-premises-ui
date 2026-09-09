/* eslint-disable no-console */
import { writeFileSync } from 'node:fs'
import { test } from '@playwright/test'
import { createOasysAssessment } from '../steps/oasys'
import { createTestPerson, PersonLifecycle } from '../setup/person'
import { WorkflowPersonGender, WorkflowPersonTier } from '../setup/workflow-person'

const outputFile = process.env.CRN_OUTPUT_FILE
const requestedTier = process.env.CAS1_E2E_PERSON_TIER as WorkflowPersonTier
const requestedGender = (process.env.CAS1_E2E_PERSON_GENDER || 'Male') as WorkflowPersonGender
const validTiers: Array<WorkflowPersonTier> = ['A', 'B', 'C', 'D', 'MISSING', 'NOT_SUPERVISED']
const validGenders: Array<WorkflowPersonGender> = ['Male', 'Female']
const assessedTiers: Array<WorkflowPersonTier> = ['A', 'B', 'C', 'D']

test('generate one persistent person for requested tier', async ({ browser }) => {
  test.setTimeout(30 * 60 * 1000)

  if (!requestedTier) {
    test.skip(true, 'only run via setup-tier-data workflow')
  }
  if (!validTiers.includes(requestedTier)) {
    throw new Error('CAS1_E2E_PERSON_TIER must be one of: A, B, C, D, MISSING, NOT_SUPERVISED')
  }
  if (!validGenders.includes(requestedGender)) {
    throw new Error('CAS1_E2E_PERSON_GENDER must be one of: Male, Female')
  }

  const context = await browser.newContext()
  const page = await context.newPage()
  const lifecycle: PersonLifecycle = { booked: false }
  const person = await createTestPerson(page, lifecycle, requestedTier, requestedGender)
  const result = { requestedTier, requestedGender, crn: person.crn, nomisId: person.nomisId, assessmentCreated: false }

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
