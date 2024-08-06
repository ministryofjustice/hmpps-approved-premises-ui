import { test } from '../../test'

import {
  assessmentShouldBeAllocatedToCorrectUser,
  createApplication,
  recordAnAppealOnApplication,
} from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { verifyEmailSent } from '../../steps/email'
import { signIn } from '../../steps/signIn'

test('Record a successful appeal against a rejected application', async ({ page, person, oasysSections, assessor }) => {
  await signIn(page, assessor)
  const { id } = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false, true)
  await assessApplication({ page, assessor, person }, id, { acceptApplication: false })
  await recordAnAppealOnApplication(page, id, 'Appeal successful')
  await assessmentShouldBeAllocatedToCorrectUser(page, id, assessor.name)
  await verifyEmailSent(assessor.email, 'Approved Premises assessment successfully appealed')
})

test('Record an unsuccessful appeal against a rejected application', async ({
  page,
  person,
  oasysSections,
  assessor,
}) => {
  await signIn(page, assessor)
  const { id } = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false, true)
  await assessApplication({ page, assessor, person }, id, { acceptApplication: false })
  await recordAnAppealOnApplication(page, id, 'Appeal unsuccessful')
  await verifyEmailSent(assessor.email, 'Approved Premises assessment appeal unsuccessful')
})
