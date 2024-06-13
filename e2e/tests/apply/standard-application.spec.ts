import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'

test('Apply, assess, match and book an application for an Approved Premises with a release date', async ({
  page,
  user,
  person,
  oasysSections,
}) => {
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, true, true)
  await assessApplication({ page, user, person }, id)
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})
