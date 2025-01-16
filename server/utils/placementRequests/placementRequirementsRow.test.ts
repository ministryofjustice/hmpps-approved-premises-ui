import { placementRequestDetailFactory } from '../../testutils/factories'
import { placementRequirementsRow } from './placementRequirementsRow'
import { requirementsHtmlString } from '../match'

describe('placementRequirementsRow', () => {
  it('returns a list of desirable placement requirements in sentence case', () => {
    const placementRequest = placementRequestDetailFactory.build()

    expect(placementRequirementsRow(placementRequest, 'desirable')).toEqual({
      key: {
        text: `Desirable Criteria`,
      },
      value: {
        html: requirementsHtmlString(placementRequest.desirableCriteria),
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
      html: requirementsHtmlString(placementRequest.essentialCriteria),
    },
  })
})
