import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { assessApplication } from '../../steps/assess'

import { startAndCreatePlacementApplication, withdrawPlacementApplication } from '../../steps/placementApplication'
import { signIn } from '../../steps/signIn'

test('Apply, assess, match and book an application for an Approved Premises without a release date', async ({
  page,

  person,
  oasysSections,
  assessor,
}) => {
  await signIn(page, assessor)
  const id = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, false)
  await assessApplication({ page, assessor, person }, id)
  await startAndCreatePlacementApplication({ page }, id)
  await withdrawPlacementApplication(page, id)

  // Skip match until it's back
  // await reviewAndApprovePlacementApplication({ page, user }, id)
  // TODO: Match and book once approval is done
})
