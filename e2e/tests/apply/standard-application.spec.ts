import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'
import { manageBooking } from '../../steps/manage'
import { signOut } from '../../steps/signOut'

test('Apply, assess, match and book an application for an Approved Premises with a release date', async ({
  page,
  assessor,
  futureManager,
  person,
  oasysSections,
}) => {
  await signIn(page, assessor)
  const { id, apType, preferredAps, preferredPostcode, releaseType } = await createApplication(
    { page, person, oasysSections, applicationType: 'standard' },
    true,
    true,
  )
  const { datesOfPlacement, duration } = await assessApplication({ page, assessor, person }, id)
  const { premisesName, newDatesOfPlacement } = await matchAndBookApplication({
    person,
    applicationId: id,
    page,
    apType,
    releaseType,
    preferredAps,
    datesOfPlacement,
    duration,
    preferredPostcode,
  })
  await signOut(page)
  await signIn(page, futureManager)
  // TODO fix this for resident profile compatibility
  // await manageBooking({
  //   page,
  //   premisesName,
  //   datesOfPlacement: newDatesOfPlacement,
  // })
})
