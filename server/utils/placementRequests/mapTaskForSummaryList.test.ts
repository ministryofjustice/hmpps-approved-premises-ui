import { applicationFactory, placementApplicationFactory } from '../../testutils/factories'
import { forPagesInTask } from '../applications/forPagesInTask'
import { mapPageForSummaryList } from './reviewUtils'
import { mapTaskForSummaryList } from './mapTaskForSummaryList'
import PlacementApplicationForm from '../../form-pages/placement-application'

jest.mock('./reviewUtils', () => ({
  mapPageForSummaryList: jest.fn(() => 'mockedPageSummary'),
}))

jest.mock('../applications/forPagesInTask', () => ({
  forPagesInTask: jest.fn((placementApplication, task, callback) => {
    callback(placementApplication, 'mockedPageName')
  }),
}))

describe('mapTaskForSummaryList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return an array of SummaryListItems', () => {
    const placementApplication = placementApplicationFactory.build()
    const application = applicationFactory.build()

    const result = mapTaskForSummaryList(placementApplication, application)

    expect(forPagesInTask).toHaveBeenCalledWith(
      placementApplication,
      PlacementApplicationForm.sections[0].tasks[0],
      expect.any(Function),
    )

    expect(mapPageForSummaryList).toHaveBeenCalledWith(placementApplication, 'mockedPageName', application)

    expect(result).toEqual(['mockedPageSummary'])
  })
})
