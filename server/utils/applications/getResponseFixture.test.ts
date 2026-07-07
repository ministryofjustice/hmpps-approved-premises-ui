import { applicationFactory } from '../../testutils/factories'
import applicationData from '../../../integration_tests/fixtures/applicationData.json'
import { getResponses } from './getResponses'
import applicationDocument from '../../../integration_tests/fixtures/applicationDocument.json'

describe('getResponses - fixture', () => {
  it('returns the correct document for the application fixture', async () => {
    const application = applicationFactory.build({ data: applicationData })
    const document = getResponses(application)
    expect(document).toEqual(applicationDocument)
  })
})
