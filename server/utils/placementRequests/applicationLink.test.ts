import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import * as utils from '../utils'
import applyPaths from '../../paths/apply'
import { applicationLink } from './applicationLink'

describe('applicationLink', () => {
  it('returns a link to the application', () => {
    jest.spyOn(utils, 'linkTo')
    const placementRequest = cas1PlacementRequestDetailFactory.build()

    applicationLink(placementRequest, 'link text', 'hidden text')

    expect(utils.linkTo).toHaveBeenCalledWith(applyPaths.applications.show({ id: placementRequest.applicationId }), {
      text: 'link text',
      hiddenText: 'hidden text',
    })
  })
})
