import { placementApplicationWithdrawalReasons } from './withdrawalReasons'

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

  describe("when the user roles include 'workflow_manager'", () => {
    it('returns all the reasons for withdrawing a placement application', () => {
      expect(placementApplicationWithdrawalReasons(['assessor', 'matcher', 'manager', 'workflow_manager'])).toEqual(
        [
          placementNoLongerNeededDividerAndRadioItems,
          noCapacityDividerAndRadioItems,
          problemInPlacementDividerAndRadioItems,
        ].flat(),
      )
    })
  })

  describe("when the user roles do not include 'workflow_manager'", () => {
    it('returns reasons for withdrawing a placement application excluding those relating to lack of capacity', () => {
      expect(placementApplicationWithdrawalReasons(['applicant'])).toEqual(
        [placementNoLongerNeededDividerAndRadioItems, problemInPlacementDividerAndRadioItems].flat(),
      )
    })
  })
})
