import { placementApplicationWithdrawalReasons } from './withdrawalReasons'
import { userDetailsFactory } from '../../../testutils/factories'

describe('placementApplicationWithdrawalReasons', () => {
  const placementNoLongerNeededDividerAndRadioItems = [
    {
      divider: 'The placement is no longer needed',
    },
    {
      checked: false,
      text: 'Another provision has been identified',
      value: 'AlternativeProvisionIdentified',
    },
    {
      checked: false,
      text: 'Their circumstances changed',
      value: 'ChangeInCircumstances',
    },
    {
      checked: false,
      text: 'The release decision changed',
      value: 'ChangeInReleaseDecision',
    },
  ]
  const noCapacityDividerAndRadioItems = [
    {
      divider: 'The placement is unavailable (CRU use only)',
    },
    {
      checked: false,
      text: "There's no capacity due to a lost bed",
      value: 'NoCapacityDueToLostBed',
    },
    {
      checked: false,
      text: "There's no capacity due to placement prioritisation",
      value: 'NoCapacityDueToPlacementPrioritisation',
    },
    {
      checked: false,
      text: "There's no capacity",
      value: 'NoCapacity',
    },
  ]
  const problemInPlacementDividerAndRadioItems = [
    {
      divider: 'Problem in placement',
    },
    {
      checked: false,
      text: 'There was an error in the request',
      value: 'ErrorInPlacementRequest',
    },
    {
      checked: false,
      text: 'The request was a duplicate',
      value: 'DuplicatePlacementRequest',
    },
  ]

  describe('when the user is a CRU member', () => {
    it('returns all the reasons for withdrawing a placement application', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_cru_dashboard'] })

      expect(placementApplicationWithdrawalReasons(user)).toEqual(
        [
          placementNoLongerNeededDividerAndRadioItems,
          noCapacityDividerAndRadioItems,
          problemInPlacementDividerAndRadioItems,
        ].flat(),
      )
    })
  })

  describe('when the user roles is not a CRU member', () => {
    it('returns reasons for withdrawing a placement application excluding those relating to lack of capacity', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(placementApplicationWithdrawalReasons(user)).toEqual(
        [placementNoLongerNeededDividerAndRadioItems, problemInPlacementDividerAndRadioItems].flat(),
      )
    })
  })
})
