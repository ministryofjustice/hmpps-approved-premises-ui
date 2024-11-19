import { ApplicationType } from '@approved-premises/e2e'
import { test } from '../test'
import { createApplication } from '../steps/apply'
import { signIn } from '../steps/signIn'
import { assessApplication } from '../steps/assess'

const applicationType = process.env.APPLICATION_TYPE as ApplicationType
const assess: string = process.env.ASSESS_APPLICATION

test(`create ${assess ? 'and assess ' : ''}${applicationType} application`, async ({
  page,
  assessor,
  person,
  oasysSections,
  emergencyApplicationUser,
}) => {
  await signIn(page, assessor)
  const { id } = await createApplication({ page, person, oasysSections, applicationType }, true, true)

  if (assess) {
    const allocatedUser = applicationType !== 'standard' ? emergencyApplicationUser : undefined
    await assessApplication({ page, assessor, person }, id, { applicationType, allocatedUser })
  }
})
