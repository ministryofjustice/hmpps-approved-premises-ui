import applicationFactory from '../../testutils/factories/application'
import { getQualificationsForApplication } from './getQualificationsForApplication'

describe('getQualificationsForAssessment', () => {
  it('returns the correct qualifications for a pipe application', () => {
    const application = applicationFactory.build({ isPipeApplication: true, isWomensApplication: false })

    expect(getQualificationsForApplication(application)).toEqual(['pipe'])
  })

  it(`returns the correct qualifications for a women's application`, () => {
    const application = applicationFactory.build({ isWomensApplication: true, isPipeApplication: false })

    expect(getQualificationsForApplication(application)).toEqual(['womens'])
  })

  it(`returns the correct qualifications for a women's and pipe application`, () => {
    const application = applicationFactory.build({ isWomensApplication: true, isPipeApplication: true })

    expect(getQualificationsForApplication(application)).toEqual(['pipe', 'womens'])
  })
})
