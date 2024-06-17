import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'

test('Apply, assess, match and book an application for an Approved Premises with a release date', async ({
  page,
  assessor,
  person,
  oasysSections,
}) => {
  await signIn(page, assessor)
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, true, true)
  await assessApplication({ page, assessor, person }, id)
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})
