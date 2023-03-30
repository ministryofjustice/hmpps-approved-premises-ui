import { addResponseToApplication, addResponsesToApplication } from './addToApplication'

import { applicationFactory } from './factories'

describe('addResponseToApplication', () => {
  it('adds a key and value to the application', () => {
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

describe('addResponsesToApplication', () => {
  it('adds an object to the application', () => {
    const application = applicationFactory.build({ data: { section: { page: {} } } })
    const response = { section: 'section', page: 'page', keyValuePairs: { key: 'value' } }

    const updatedApplication = addResponsesToApplication(application, response)

    expect(updatedApplication.data).toEqual({
      ...application.data,
      [response.section]: {
        [response.page]: {
          key: response.keyValuePairs.key,
        },
      },
    })
  })
})
