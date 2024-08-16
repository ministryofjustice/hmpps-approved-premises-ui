import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'

test('Apply, assess, match and book an application for an Approved Premises with a release date', async ({
  page,
  assessor,
  person,
  oasysSections,
}) => {
  await signIn(page, assessor)
  const { id, apType, preferredAps, preferredPostcode } = await createApplication(
    { page, person, oasysSections, applicationType: 'standard' },
    true,
    true,
  )
  const { datesOfPlacement, duration, placementCharacteristics } = await assessApplication(
    { page, assessor, person },
    id,
  )
  await matchAndBookApplication({
    applicationId: id,
    page,
    apType,
    preferredAps,
    datesOfPlacement,
    duration,
    preferredPostcode,
    placementCharacteristics,
  })
})
