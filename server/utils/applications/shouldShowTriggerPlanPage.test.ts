import { applicationFactory } from '../../testutils/factories'
import { shouldShowTriggerPlanPages } from './shouldShowTriggerPlanPage'

describe('shouldShowTriggerPlanPage', () => {
  it('returns true if the application is an emergency application', () => {
    const application = applicationFactory.emergencyApplication().build()

    expect(shouldShowTriggerPlanPages(application)).toBe(true)
  })

  it('returns true if the application is an emergency application', () => {
    const application = applicationFactory.nonemergencyApplication().build()

    expect(shouldShowTriggerPlanPages(application)).toBe(false)
  })
})
