import { ApplicationType } from '@approved-premises/e2e'
import { test } from '../test'
import { createApplication } from '../steps/apply'
import { signIn } from '../steps/signIn'

const applicationType = process.env.APPLICATION_TYPE as ApplicationType

test(`create ${applicationType} application`, async ({ page, assessor, person, oasysSections }) => {
  await signIn(page, assessor)
  await createApplication({ page, person, oasysSections, applicationType }, true, true)
})
