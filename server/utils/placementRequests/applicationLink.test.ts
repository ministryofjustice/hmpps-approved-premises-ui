import { placementRequestFactory } from '../../testutils/factories'
import { linkTo } from '../utils'
import applyPaths from '../../paths/apply'
import { applicationLink } from './applicationLink'

jest.mock('../utils')

describe('applicationLink', () => {
  it('returns a link to the application', () => {
    const placementRequest = placementRequestFactory.build()

    applicationLink(placementRequest, 'link text', 'hidden text')

    expect(linkTo).toHaveBeenCalledWith(
      applyPaths.applications.show,
      { id: placementRequest.applicationId },
      { text: 'link text', hiddenText: 'hidden text' },
    )
  })
})
