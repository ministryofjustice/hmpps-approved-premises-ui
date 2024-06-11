import { test } from '../../test'

import { setRoles } from '../../steps/admin'
import {
  assessmentShouldBeAllocatedToCorrectUser,
  createApplication,
  recordAnAppealOnApplication,
} from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { verifyEmailSent } from '../../steps/email'

test('Record a successful appeal against a rejected application', async ({ page, user, person, oasysSections }) => {
  await setRoles(page, user.name, ['Assessor'])
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false, true)
  await assessApplication({ page, user, person }, id, { acceptApplication: false })
  await recordAnAppealOnApplication(page, id, 'Appeal successful')
  await assessmentShouldBeAllocatedToCorrectUser(page, id, user.name)
  await verifyEmailSent(user.email, 'Approved Premises assessment successfully appealed')
})

test('Record an unsuccessful appeal against a rejected application', async ({ page, user, person, oasysSections }) => {
  await setRoles(page, user.name, ['Assessor'])
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false, true)
  await assessApplication({ page, user, person }, id, { acceptApplication: false })
  await recordAnAppealOnApplication(page, id, 'Appeal unsuccessful')
  await verifyEmailSent(user.email, 'Approved Premises assessment appeal unsuccessful')
})
