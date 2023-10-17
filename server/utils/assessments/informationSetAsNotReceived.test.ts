import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import informationSetAsNotReceived from './informationSetAsNotReceived'

describe('informationSetAsNotReceived', () => {
  const assessment = assessmentFactory.build({ status: 'awaiting_response' })

  it('returns false when there is no data', () => {
    assessment.data = {}

    expect(informationSetAsNotReceived(assessment)).toEqual(false)
  })

  it('returns false when informationReceived is set to yes', () => {
    assessment.data = { 'sufficient-information': { 'information-received': { informationReceived: 'yes' } } }

    expect(informationSetAsNotReceived(assessment)).toEqual(false)
  })

  it('returns true when informationReceived is set to no', () => {
    assessment.data = { 'sufficient-information': { 'information-received': { informationReceived: 'no' } } }

    expect(informationSetAsNotReceived(assessment)).toEqual(true)
  })

  it('returns false when the application is not pending', () => {
    assessment.status = 'in_progress'

    expect(informationSetAsNotReceived(assessment)).toEqual(false)
  })

  it('returns false when the argument is an Application', () => {
    const application = applicationFactory.build()

    expect(informationSetAsNotReceived(application)).toEqual(false)
  })
})
