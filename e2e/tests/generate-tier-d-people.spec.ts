/* eslint-disable no-await-in-loop, no-console */
import { writeFileSync } from 'node:fs'
import { test } from '@playwright/test'
import { createOasysAssessment } from '../setup/oasys'
import { createTestPerson, PersonLifecycle } from '../setup/person'

const outputFile = process.env.CRN_OUTPUT_FILE
const sexes = ['Male', 'Female'] as const

test('generate persistent male and female Tier D people', async ({ browser }) => {
  test.setTimeout(30 * 60 * 1000)

  const context = await browser.newContext()
  const page = await context.newPage()
  const generated: Array<{
    sex: (typeof sexes)[number]
    crn: string
    nomisId: string
    assessmentCreated: boolean
  }> = []

  try {
    for (const sex of sexes) {
      const lifecycle: PersonLifecycle = { booked: false }
      const person = await createTestPerson(page, lifecycle, 'D', sex)
      const result = { sex, crn: person.crn, nomisId: person.nomisId, assessmentCreated: false }
      generated.push(result)
      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(generated, null, 2))
      }

      await createOasysAssessment(context, person, 'D')
      result.assessmentCreated = true
      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(generated, null, 2))
      }
    }

    console.log(`Generated Tier D people: ${JSON.stringify(generated)}`)
  } finally {
    await context.close()
  }
})
