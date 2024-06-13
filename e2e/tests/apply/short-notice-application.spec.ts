import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'

test('Apply, assess, match and book an short notice application for an Approved Premises with a release date', async ({
  page,
  user,
  person,
  oasysSections,
  emergencyApplicationUser,
}) => {
  const id = await createApplication({ page, person, oasysSections, applicationType: 'shortNotice' }, true, true)
  await assessApplication({ page, user, person }, id, {
    applicationType: 'shortNotice',
    acceptApplication: true,
    allocatedUser: emergencyApplicationUser,
  })
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})
