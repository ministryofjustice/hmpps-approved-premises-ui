import { placementRequestDetailFactory } from '../../testutils/factories'
import { placementRequirementsRow } from './placementRequirementsRow'

import { characteristicsBulletList } from '../characteristicsUtils'

describe('placementRequirementsRow', () => {
  it('returns a list of desirable placement requirements in sentence case', () => {
    const placementRequest = placementRequestDetailFactory.build()

    expect(placementRequirementsRow(placementRequest, 'desirable')).toEqual({
      key: {
        text: `Desirable Criteria`,
      },
      value: {
        html: characteristicsBulletList(placementRequest.desirableCriteria),
      },
    })
  })
})

it('returns a list of essential placement requirements in sentence case', () => {
  const placementRequest = placementRequestDetailFactory.build()

  expect(placementRequirementsRow(placementRequest, 'essential')).toEqual({
    key: {
      text: `Essential Criteria`,
    },
    value: {
      html: characteristicsBulletList(placementRequest.essentialCriteria),
    },
  })
})
