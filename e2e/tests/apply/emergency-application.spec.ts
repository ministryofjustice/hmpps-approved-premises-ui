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
  const { id, preferredAps, apType, preferredPostcode } = await createApplication(
    { page, person, oasysSections, applicationType: 'emergency' },
    true,
  )
  const { datesOfPlacement, duration, placementCharacteristics } = await assessApplication(
    { page, assessor, person },
    id,
    {
      applicationType: 'emergency',
      allocatedUser: emergencyApplicationUser,
    },
  )

  await matchAndBookApplication({
    applicationId: id,
    page,
    datesOfPlacement,
    duration,
    placementCharacteristics,
    apType,
    preferredAps,
    preferredPostcode,
  })
})
