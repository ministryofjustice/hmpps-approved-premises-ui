import { PlacementApplication } from '../../@types/shared'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../testutils/addToApplication'
import { placementApplicationFactory } from '../../testutils/factories'
import { placementApplicationSubmissionData } from './placementApplicationSubmissionData'

jest.mock('../../form-pages/utils')

describe('placementApplicationSubmissionData', () => {
  it('returns the data in the correct format for submission', () => {
    let placementApplication = placementApplicationFactory.build()
    placementApplication = addResponseToFormArtifact(placementApplication, {
      section: 'request-a-placement',
      page: 'reason-for-placement',
      key: 'reason',
      value: 'rotl',
    }) as PlacementApplication
    placementApplication = addResponsesToFormArtifact(placementApplication, {
      section: 'request-a-placement',
      page: 'dates-of-placement',
      keyValuePairs: {
        arrivalDate: '2023-01-01',
        duration: '1',
      },
    }) as PlacementApplication
    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      reason: 'rotl',
      duration: '1',
      arrivalDate: '2023-01-01',
    })

    expect(placementApplicationSubmissionData(placementApplication)).toEqual({
      placementType: 'rotl',
      translatedDocument: {},
      placementDates: [
        {
          expectedArrival: '2023-01-01',
          duration: 1,
        },
      ],
    })
  })
})
