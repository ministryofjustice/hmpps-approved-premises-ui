import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue } from '../../shared'

import DateOfPlacementPage from './datesOfPlacement'
import { placementApplicationFactory } from '../../../testutils/factories'
import { addResponseToFormArtifact } from '../../../testutils/addToApplication'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import { DateFormats } from '../../../utils/dateUtils'

jest.mock('../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('DateOfPlacement', () => {
  const body = {
    datesOfPlacement: [
      {
        durationWeeks: '2',
        durationDays: '1',
        isFlexible: 'yes',
        'arrivalDate-day': '1',
        'arrivalDate-month': '12',
        'arrivalDate-year': '2023',
      },
      {
        durationWeeks: '2',
        durationDays: '3',
        isFlexible: 'no',
        'arrivalDate-day': '2',
        'arrivalDate-month': '1',
        'arrivalDate-year': '2024',
      },
    ],
  }

  let placementApplication = placementApplicationFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('body', () => {
    it('should set the body', () => {
      expect(new DateOfPlacementPage(body, placementApplication).body).toEqual({
        datesOfPlacement: [
          {
            duration: '15',
            durationDays: '1',
            durationWeeks: '2',
            'arrivalDate-year': '2023',
            'arrivalDate-month': '12',
            'arrivalDate-day': '1',
            arrivalDate: '2023-12-01',
            isFlexible: 'yes',
          },
          {
            duration: '17',
            durationDays: '3',
            durationWeeks: '2',
            'arrivalDate-year': '2024',
            'arrivalDate-month': '1',
            'arrivalDate-day': '2',
            arrivalDate: '2024-01-02',
            isFlexible: 'no',
          },
        ],
      })
    })
  })

  describe('previous', () => {
    describe('if the answer to "previousRotlPlacement" was yes', () => {
      it('returns "same-ap"', () => {
        placementApplication = addResponseToFormArtifact(placementApplication, {
          task: 'request-a-placement',
          page: 'previous-rotl-placement',
          key: 'previousRotlPlacement',
          value: 'yes',
        })
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('yes')

        expect(new DateOfPlacementPage(body, placementApplication).previous()).toEqual('same-ap')
      })
    })

    describe('if the answer to "previousRotlPlacement" was no', () => {
      it('returns "previous-rotl-placement"', () => {
        placementApplication = addResponseToFormArtifact(placementApplication, {
          task: 'request-a-placement',
          page: 'previous-rotl-placement',
          key: 'previousRotlPlacement',
          value: 'no',
        })
        ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('no')

        expect(new DateOfPlacementPage(body, placementApplication).previous()).toEqual('previous-rotl-placement')
      })
    })
  })

  itShouldHaveNextValue(new DateOfPlacementPage(body, placementApplication), 'updates-to-application')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new DateOfPlacementPage(body, placementApplication)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if the first date and duration is blank', () => {
      const page = new DateOfPlacementPage(fromPartial({}), placementApplication)
      expect(page.errors()).toEqual({
        datesOfPlacement_0_arrivalDate: 'Enter an arrival date for the placement',
        datesOfPlacement_0_duration: 'Enter the duration of the placement',
        datesOfPlacement_0_isFlexible: 'State if the placement date is flexible',
      })
    })

    it('should return an error if the first date is blank', () => {
      const page = new DateOfPlacementPage(
        fromPartial({
          datesOfPlacement: [
            { ...body.datesOfPlacement[0], 'arrivalDate-day': '', 'arrivalDate-month': '', 'arrivalDate-year': '' },
          ],
        }),
        placementApplication,
      )
      expect(page.errors()).toEqual({
        datesOfPlacement_0_arrivalDate: 'Enter an arrival date for the placement',
      })
    })

    it('should return an error if the first duration is blank', () => {
      const page = new DateOfPlacementPage(
        fromPartial({ datesOfPlacement: [{ ...body.datesOfPlacement[0], durationDays: '', durationWeeks: '' }] }),
        placementApplication,
      )
      expect(page.errors()).toEqual({
        datesOfPlacement_0_duration: 'Enter the duration of the placement',
      })
    })

    it('should return an error if the isFlexible radio is blank', () => {
      const page = new DateOfPlacementPage(
        fromPartial({ datesOfPlacement: [{ ...body.datesOfPlacement[0], isFlexible: '' }] }),
        placementApplication,
      )
      expect(page.errors()).toEqual({
        datesOfPlacement_0_isFlexible: 'State if the placement date is flexible',
      })
    })

    it('should return errors if the placement date is invalid', () => {
      const page = new DateOfPlacementPage(
        {
          datesOfPlacement: [
            {
              ...body.datesOfPlacement[0],
              'arrivalDate-day': '9999999',
              'arrivalDate-month': '99',
              'arrivalDate-year': '32',
            },
          ],
        },
        placementApplication,
      )
      expect(page.errors()).toEqual({ datesOfPlacement_0_arrivalDate: 'Enter an arrival date for the placement' })
    })

    it('should return errors if the duration is empty', () => {
      const page = new DateOfPlacementPage(
        {
          datesOfPlacement: [
            {
              ...body.datesOfPlacement[0],
              durationDays: '0',
              durationWeeks: '',
            },
          ],
        },
        placementApplication,
      )

      expect(page.errors()).toEqual({ datesOfPlacement_0_duration: 'Enter the duration of the placement' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DateOfPlacementPage(body, placementApplication)

      expect(page.response()).toEqual({
        'Dates of placement': [
          {
            'How long should the Approved Premises placement last?': '2 weeks, 1 day',
            'When will the person arrive?': DateFormats.dateAndTimeInputsToUiDate(
              body.datesOfPlacement[0],
              'arrivalDate',
            ),
            'Is the date flexible?': 'Yes',
          },
          {
            'How long should the Approved Premises placement last?': '2 weeks, 3 days',
            'When will the person arrive?': DateFormats.dateAndTimeInputsToUiDate(
              body.datesOfPlacement[1],
              'arrivalDate',
            ),
            'Is the date flexible?': 'No',
          },
        ],
      })
    })
  })
})
