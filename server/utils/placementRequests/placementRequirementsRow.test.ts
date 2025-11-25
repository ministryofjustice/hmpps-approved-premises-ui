import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { placementRequirementsRow } from './placementRequirementsRow'

import { characteristicsBulletList } from '../characteristicsUtils'

describe('placementRequirementsRow', () => {
  it('returns a list of placement requirements in sentence case', () => {
    const placementRequest = cas1PlacementRequestDetailFactory.build()

    expect(placementRequirementsRow(placementRequest)).toEqual({
      key: {
        text: `Criteria`,
      },
      value: {
        html: characteristicsBulletList(placementRequest.essentialCriteria),
      },
    })
  })
})
