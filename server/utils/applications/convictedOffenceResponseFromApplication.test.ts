import applicationFactory from '../../testutils/factories/application'
import { SessionDataError } from '../errors'
import { convictedOffenceResponseFromApplication } from './convictedOffenceResponseFromApplication'

describe('convictedOffenceResponseFromApplication', () => {
  it('should return the correct response', () => {
    const application = applicationFactory
      .withPageResponse({
        task: 'risk-management-features',
        page: 'convicted-offences',
        key: 'response',
        value: 'yes',
      })
      .build()

    expect(convictedOffenceResponseFromApplication(application)).toEqual('yes')
  })

  it("throws a SessionDataError if the property doesn't exist", () => {
    const application = applicationFactory.build()
    expect(() => convictedOffenceResponseFromApplication(application)).toThrow(SessionDataError)
  })
})
