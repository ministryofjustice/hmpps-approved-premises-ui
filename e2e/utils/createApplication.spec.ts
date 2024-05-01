import { ApplicationType } from '@approved-premises/e2e'
import { test } from '../test'
import { createApplication } from '../steps/apply'

const applicationType = process.env.APPLICATION_TYPE as ApplicationType

test(`create ${applicationType} application`, async ({ page, person, oasysSections }) => {
  await createApplication({ page, person, oasysSections, applicationType }, true, true)
})
