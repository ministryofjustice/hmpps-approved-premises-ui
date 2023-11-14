import { addResponseToFormArtifact, addResponsesToFormArtifact } from './addToApplication'

import { applicationFactory } from './factories'

describe('addResponseToApplication', () => {
  it('adds a key and value to the application', () => {
    const application = applicationFactory.build()
    const response = { task: 'task', page: 'page', key: 'key', value: 'value' }

    const updatedApplication = addResponseToFormArtifact(application, response)

    expect(updatedApplication.data).toEqual({
      ...application.data,
      [response.task]: {
        [response.page]: {
          [response.key]: response.value,
        },
      },
    })
  })
})

describe('addResponsesToApplication', () => {
  it('adds an object to the application', () => {
    const application = applicationFactory.build({ data: { task: { page: {} } } })
    const response = { task: 'task', page: 'page', keyValuePairs: { key: 'value' } }

    const updatedApplication = addResponsesToFormArtifact(application, response)

    expect(updatedApplication.data).toEqual({
      ...application.data,
      [response.task]: {
        [response.page]: {
          key: response.keyValuePairs.key,
        },
      },
    })
  })
})
