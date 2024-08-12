import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'
import { signIn } from '../../steps/signIn'
import { matchAndBookApplication } from '../../steps/match'
import { DateFormats } from '../../../server/utils/dateUtils'

test('Apply, assess, match and book an short notice application for an Approved Premises with a release date', async ({
  page,
  person,
  oasysSections,
  emergencyApplicationUser,
  assessor,
}) => {
  await signIn(page, assessor)
  const { id, apType, preferredAps, preferredPostcode } = await createApplication(
    { page, person, oasysSections, applicationType: 'shortNotice' },
    true,
    true,
  )
  const { duration, datesOfPlacement, placementCharacteristics } = await assessApplication(
    { page, assessor, person },
    id,
    {
      applicationType: 'shortNotice',
      acceptApplication: true,
      allocatedUser: emergencyApplicationUser,
    },
  )

  await matchAndBookApplication({
    page,
    person,
    apType,
    preferredAps,
    datesOfPlacement,
    duration,
    preferredPostcode,
    placementCharacteristics,
    applicationDate: DateFormats.dateObjtoUIDate(new Date(), { format: 'short' }),
    isParole: false,
  })
})
