import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'

test('Apply, assess, match and book an emergency application for an Approved Premises', async ({
  page,
  person,
  oasysSections,
  emergencyApplicationUser,
  assessor,
}) => {
  await signIn(page, assessor)
  const { id, preferredAps, apType, preferredPostcode, releaseType } = await createApplication(
    { page, person, oasysSections, applicationType: 'emergency' },
    true,
  )
  const { datesOfPlacement, duration } = await assessApplication({ page, assessor, person }, id, {
    applicationType: 'emergency',
    allocatedUser: emergencyApplicationUser,
  })

  await matchAndBookApplication({
    person,
    applicationId: id,
    page,
    datesOfPlacement,
    duration,
    apType,
    preferredAps,
    preferredPostcode,
    releaseType,
  })
})
