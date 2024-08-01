import { placementRequestDetailFactory } from '../../testutils/factories'
import { mapSearchParamCharacteristicsForUi } from '../match/mapSearchParamCharacteristicsForUi'
import { placementRequirementsRow } from './placementRequirementsRow'

describe('placementRequirementsRow', () => {
  it('returns a list of desirable placement requirements in sentence case', () => {
    const placementRequest = placementRequestDetailFactory.build()

    expect(placementRequirementsRow(placementRequest, 'desirable')).toEqual({
      key: {
        text: `Desirable Criteria`,
      },
      value: {
        html: mapSearchParamCharacteristicsForUi(placementRequest.desirableCriteria),
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
      html: mapSearchParamCharacteristicsForUi(placementRequest.essentialCriteria),
    },
  })
})
