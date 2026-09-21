import { manageBooking } from 'e2e/steps/manage'
import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'
import { signOut } from '../../steps/signOut'

function stopAtStage(stage: string): boolean {
  return process.env.STOP_AT_STAGE === stage
}

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

  if (stopAtStage('application-created')) return

  const { datesOfPlacement, duration } = await assessApplication({ page, assessor, person }, id)

  if (stopAtStage('application-assessed')) return

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

  if (stopAtStage('application-matched-and-booked')) return

  await signOut(page)
  await signIn(page, futureManager)
  await manageBooking({
    page,
    premisesName,
    datesOfPlacement: newDatesOfPlacement,
  })

  if (stopAtStage('booking-managed')) return
})
