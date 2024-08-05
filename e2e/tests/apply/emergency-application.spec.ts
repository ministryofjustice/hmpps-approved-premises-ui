import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'
import { DateFormats } from '../../../server/utils/dateUtils'

test('Apply, assess, match and book an emergency application for an Approved Premises', async ({
  page,
  person,
  oasysSections,
  emergencyApplicationUser,
  assessor,
}) => {
  await signIn(page, assessor)
  const id = await createApplication({ page, person, oasysSections, applicationType: 'emergency' }, true)
  const { datesOfPlacement, duration } = await assessApplication({ page, assessor, person }, id, {
    applicationType: 'emergency',
    allocatedUser: emergencyApplicationUser,
  })

  await matchAndBookApplication({
    page,
    person,
    datesOfPlacement,
    duration,
    isParole: false,
    applicationDate: DateFormats.dateObjtoUIDate(new Date(), { format: 'short' }),
  })
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})
