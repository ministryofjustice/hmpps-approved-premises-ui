import { documentRender } from './documentRender'
import { applicationFactory } from '../testutils/factories'
import applicationData from '../../integration_tests/fixtures/applicationData.json'
import applicationDocument from '../../integration_tests/fixtures/applicationDocument.json'

describe('DocumentRenderer', () => {
  it('returns a rendered document from an application', async () => {
    const application = applicationFactory.build({ data: applicationData })
    const document = await documentRender(application)
    expect(document).toEqual(applicationDocument)
  })
})
