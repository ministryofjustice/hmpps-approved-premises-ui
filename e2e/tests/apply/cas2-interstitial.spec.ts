import { startIneligibleApplication } from 'e2e/steps/apply'
import { signIn } from 'e2e/steps/signIn'
import { test } from '../../test'

const person = {
  name: 'Harvey Corwin',
  crn: 'Y052015',
  tier: 'E',
}

test('CAS2 interstitial page shown for ineligible person', async ({ page, assessor }) => {
  test.skip(true, 'CAS2 interstitial page test is skipped until V3 tiers are enabled in dev')
  await signIn(page, assessor)
  await startIneligibleApplication({ page, person })
})
