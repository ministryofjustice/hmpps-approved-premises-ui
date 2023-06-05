import { applicationLink } from './applicationLink'
import { placementRequestFactory } from '../../testutils/factories'

describe('applicationLink', () => {
  it('returns a link to the application', () => {
    const placementRequest = placementRequestFactory.build()

    expect(applicationLink(placementRequest, 'link text', 'hidden text')).toEqual(
      `<a href="/applications/${placementRequest.applicationId}" >link text <span class="govuk-visually-hidden">hidden text</span></a>`,
    )
  })
})
