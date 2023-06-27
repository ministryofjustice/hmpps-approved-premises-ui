import { applicationFactory } from '../../testutils/factories'
import { getResponseForPage } from './getResponseForPage'
import Apply from '../../form-pages/apply'

const ApplyPage = jest.fn()

Apply.pages['basic-information'] = {
  somePage: ApplyPage,
}

describe('getResponseForPage', () => {
  it('returns the response for a given page', () => {
    ApplyPage.mockReturnValue({
      response: () => {
        return { foo: 'bar' }
      },
    })

    const application = applicationFactory.build()
    application.data = { 'basic-information': { first: '', second: '' } }

    expect(getResponseForPage(application, 'basic-information', 'somePage')).toEqual({
      foo: 'bar',
    })
  })
})
