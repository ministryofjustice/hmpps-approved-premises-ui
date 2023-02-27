import applicationFactory from './factories/application'
import { addResponseToApplication } from './addResponseToApplication'

describe('addResponseToApplication', () => {
  it('adds a response to the application', () => {
    const application = applicationFactory.build()
    const response = { section: 'section', page: 'page', key: 'key', value: 'value' }

    const updatedApplication = addResponseToApplication(application, response)

    expect(updatedApplication.data).toEqual({
      ...application.data,
      [response.section]: {
        [response.page]: {
          [response.key]: response.value,
        },
      },
    })
  })
})
