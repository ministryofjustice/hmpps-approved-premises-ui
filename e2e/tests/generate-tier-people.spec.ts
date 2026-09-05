/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-console */
import { writeFileSync } from 'node:fs'
import { PersonTier } from '@approved-premises/e2e'
import { expect, test } from '@playwright/test'
import { deleteOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/delete-offender.mjs'
import { createOasysAssessment } from '../steps/oasys'
import { createTestPerson, loginDelius, PersonLifecycle } from '../setup/person'

const tiers: Array<PersonTier> = ['B', 'C', 'D', 'E', 'F', 'G']
const outputFile = process.env.CRN_OUTPUT_FILE

test('generate persistent people for tiers A to G', async ({ browser }) => {
  test.setTimeout(60 * 60 * 1000)

  const context = await browser.newContext()
  const page = await context.newPage()
  const generated: Array<{ tier: PersonTier; crn: string; nomisId: string; assessmentCreated: boolean }> = [
    { tier: 'A', crn: 'Y047694', nomisId: 'A4880ED', assessmentCreated: true },
  ]

  try {
    await loginDelius(page)
    await deleteOffender(page, 'Y047695')
    await expect(page).toHaveTitle(/National Search/)
    await expect(page.getByText('No records found.')).toBeVisible()

    for (const tier of tiers) {
      const lifecycle: PersonLifecycle = { booked: false }
      const person = await createTestPerson(page, lifecycle, tier)
      const result = { tier, crn: person.crn, nomisId: person.nomisId, assessmentCreated: false }
      generated.push(result)
      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(generated, null, 2))
      }

      await createOasysAssessment(context, person, tier)
      result.assessmentCreated = true
      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(generated, null, 2))
      }
    }

    console.log(`Generated tier people: ${JSON.stringify(generated)}`)
  } finally {
    await context.close()
  }
})
