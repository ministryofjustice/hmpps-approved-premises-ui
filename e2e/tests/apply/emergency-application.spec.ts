import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'

test('Apply, assess, match and book an emergency application for an Approved Premises', async ({
  page,
  person,
  oasysSections,
  emergencyApplicationUser,
  assessor,
}) => {
  await signIn(page, assessor)
  const id = await createApplication({ page, person, oasysSections, applicationType: 'emergency' }, true)
  await assessApplication({ page, assessor, person }, id, {
    applicationType: 'emergency',
    allocatedUser: emergencyApplicationUser,
  })
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})
