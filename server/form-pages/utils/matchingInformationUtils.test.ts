import { when } from 'jest-when'
import { BackwardsCompatibleApplyApType } from '@approved-premises/ui'
import { placementDurationFromApplication } from '../../utils/assessments/placementDurationFromApplication'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../utils/retrieveQuestionResponseFromFormArtifact'
import { applicationFactory } from '../../testutils/factories'
import { MatchingInformationBody } from '../assess/matchingInformation/matchingInformationTask/matchingInformation'
import {
  TaskListPageField,
  defaultMatchingInformationValues,
  remapArsonAssessmentData,
  suggestedStaySummaryListOptions,
} from './matchingInformationUtils'
import AccessNeedsFurtherQuestions from '../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'
import Catering from '../apply/risk-and-need-factors/further-considerations/catering'
import Arson from '../apply/risk-and-need-factors/further-considerations/arson'
import RoomSharing from '../apply/risk-and-need-factors/further-considerations/roomSharing'
import Covid from '../apply/risk-and-need-factors/access-and-healthcare/covid'
import DateOfOffence from '../apply/risk-and-need-factors/risk-management-features/dateOfOffence'
import Vulnerability from '../apply/risk-and-need-factors/further-considerations/vulnerability'
import SelectApType from '../apply/reasons-for-placement/type-of-ap/apType'
import PlacementDate from '../apply/reasons-for-placement/basic-information/placementDate'
import ReleaseDate from '../apply/reasons-for-placement/basic-information/releaseDate'

jest.mock('../../utils/assessments/placementDurationFromApplication')
jest.mock('../../utils/retrieveQuestionResponseFromFormArtifact')

describe('matchingInformationUtils', () => {
  const application = applicationFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })
  const bodyWithUndefinedValues: MatchingInformationBody = {
    acceptsChildSexOffenders: undefined,
    acceptsHateCrimeOffenders: undefined,
    acceptsNonSexualChildOffenders: undefined,
    acceptsSexOffenders: undefined,
    apType: undefined,
    cruInformation: undefined,
    hasEnSuite: undefined,
    isArsonSuitable: undefined,
    isArsonDesignated: undefined,
    isCatered: undefined,
    isSingle: undefined,
    isStepFreeDesignated: undefined,
    isSuitableForVulnerable: undefined,
    isSuitedForSexOffenders: undefined,
    isWheelchairDesignated: undefined,
    lengthOfStay: undefined,
    lengthOfStayAgreed: undefined,
    lengthOfStayDays: undefined,
    lengthOfStayWeeks: undefined,
  }
  describe('defaultMatchingInformationValues', () => {
    const adultSexualOffencesFields = ['contactSexualOffencesAgainstAdults', 'nonContactSexualOffencesAgainstAdults']
    const childSexualOffencesFields = [
      'contactSexualOffencesAgainstChildren',
      'nonContactSexualOffencesAgainstChildren',
    ]
    const sexualOffencesFields = [...adultSexualOffencesFields, ...childSexualOffencesFields]

    it('returns an object with current or sensible default values for relevant fields', () => {
      const yesNoFieldsToMock: Array<TaskListPageField & { value?: 'yes' | 'no' }> = [
        { name: 'arson', page: Arson },
        { name: 'boosterEligibility', page: Covid },
        { name: 'catering', page: Catering, value: 'no' },
        { name: 'exploitable', page: Vulnerability },
        { name: 'immunosuppressed', page: Covid },
        { name: 'needsWheelchair', page: AccessNeedsFurtherQuestions, optional: true },
        { name: 'riskToOthers', page: RoomSharing },
        { name: 'riskToStaff', page: RoomSharing },
        { name: 'sharingConcerns', page: RoomSharing },
        { name: 'traumaConcerns', page: RoomSharing },
      ]

      yesNoFieldsToMock.forEach(({ name, page, value, optional }) =>
        when(optional ? retrieveOptionalQuestionResponseFromFormArtifact : retrieveQuestionResponseFromFormArtifact)
          .calledWith(application, page, name)
          .mockReturnValue(value || 'yes'),
      )

      const dateOfOffenceFieldsToMock = [
        'arsonOffence',
        'hateCrime',
        'nonSexualOffencesAgainstChildren',
        ...sexualOffencesFields,
      ]

      dateOfOffenceFieldsToMock.forEach(field =>
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, DateOfOffence, field)
          .mockReturnValue(['current', 'previous']),
      )

      when(retrieveQuestionResponseFromFormArtifact)
        .calledWith(application, SelectApType, 'type')
        .mockReturnValue('pipe')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual({
        acceptsChildSexOffenders: 'relevant',
        acceptsHateCrimeOffenders: 'relevant',
        acceptsNonSexualChildOffenders: 'relevant',
        acceptsSexOffenders: 'relevant',
        apType: 'isPIPE',
        isArsonSuitable: 'essential',
        isCatered: 'essential',
        isSingle: 'essential',
        isSuitableForVulnerable: 'relevant',
        isSuitedForSexOffenders: 'essential',
        isWheelchairDesignated: 'essential',
      })
    })

    describe('values for placement requirements and offence and risk criteria', () => {
      it('uses current values where they exist', () => {
        const currentValues: Partial<MatchingInformationBody> = {
          acceptsChildSexOffenders: 'relevant',
          acceptsHateCrimeOffenders: 'relevant',
          acceptsNonSexualChildOffenders: 'relevant',
          acceptsSexOffenders: 'relevant',
          apType: 'isPIPE',
          isArsonSuitable: 'desirable',
          isCatered: 'desirable',
          isSingle: 'desirable',
          isSuitableForVulnerable: 'relevant',
          isSuitedForSexOffenders: 'desirable',
          isWheelchairDesignated: 'desirable',
        }

        expect(defaultMatchingInformationValues({ ...bodyWithUndefinedValues, ...currentValues }, application)).toEqual(
          expect.objectContaining(currentValues),
        )
      })

      describe("when there's no current value for a given field", () => {
        const truthyCurrentPreviousValues = [['current'], ['previous'], ['current', 'previous']]

        describe('acceptsChildSexOffenders', () => {
          truthyCurrentPreviousValues.forEach(value => {
            it.each(childSexualOffencesFields)(
              `is set to 'essential' when \`%s\` === ['${value.join("', '")}']`,
              testedField => {
                childSexualOffencesFields.forEach(field =>
                  when(retrieveOptionalQuestionResponseFromFormArtifact)
                    .calledWith(application, DateOfOffence, field)
                    .mockReturnValue(testedField === field ? value : undefined),
                )

                expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
                  expect.objectContaining({ acceptsChildSexOffenders: 'relevant' }),
                )
              },
            )
          })

          it("is set to 'notRelevant' when all relevant fields === undefined", () => {
            childSexualOffencesFields.forEach(field =>
              when(retrieveOptionalQuestionResponseFromFormArtifact)
                .calledWith(application, DateOfOffence, field)
                .mockReturnValue(undefined),
            )

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ acceptsChildSexOffenders: 'notRelevant' }),
            )
          })
        })

        describe('acceptsHateCrimeOffenders', () => {
          truthyCurrentPreviousValues.forEach(value => {
            it(`is set to 'relevant' when \`hateCrime\` === ['${value.join("', '")}']`, () => {
              when(retrieveOptionalQuestionResponseFromFormArtifact)
                .calledWith(application, DateOfOffence, 'hateCrime')
                .mockReturnValue(value)

              expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
                expect.objectContaining({ acceptsHateCrimeOffenders: 'relevant' }),
              )
            })
          })

          it("is set to 'notRelevant' when `hateCrime` === undefined", () => {
            when(retrieveOptionalQuestionResponseFromFormArtifact)
              .calledWith(application, DateOfOffence, 'hateCrime')
              .mockReturnValue(undefined)

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ acceptsHateCrimeOffenders: 'notRelevant' }),
            )
          })
        })

        describe('acceptsNonSexualChildOffenders', () => {
          truthyCurrentPreviousValues.forEach(value => {
            it(`is set to 'relevant' when \`nonSexualOffencesAgainstChildren\` === ['${value.join("', '")}']`, () => {
              when(retrieveOptionalQuestionResponseFromFormArtifact)
                .calledWith(application, DateOfOffence, 'nonSexualOffencesAgainstChildren')
                .mockReturnValue(value)

              expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
                expect.objectContaining({ acceptsNonSexualChildOffenders: 'relevant' }),
              )
            })
          })

          it("is set to 'notRelevant' when `nonSexualOffencesAgainstChildren` === undefined", () => {
            when(retrieveOptionalQuestionResponseFromFormArtifact)
              .calledWith(application, DateOfOffence, 'nonSexualOffencesAgainstChildren')
              .mockReturnValue(undefined)

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ acceptsNonSexualChildOffenders: 'notRelevant' }),
            )
          })
        })

        describe('acceptsSexOffenders', () => {
          truthyCurrentPreviousValues.forEach(value => {
            it.each(adultSexualOffencesFields)(
              `is set to 'essential' when \`%s\` === ['${value.join("', '")}']`,
              testedField => {
                adultSexualOffencesFields.forEach(field =>
                  when(retrieveOptionalQuestionResponseFromFormArtifact)
                    .calledWith(application, DateOfOffence, field)
                    .mockReturnValue(testedField === field ? value : undefined),
                )

                expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
                  expect.objectContaining({ acceptsSexOffenders: 'relevant' }),
                )
              },
            )
          })

          it("is set to 'notRelevant' when all relevant fields === undefined", () => {
            adultSexualOffencesFields.forEach(field =>
              when(retrieveOptionalQuestionResponseFromFormArtifact)
                .calledWith(application, DateOfOffence, field)
                .mockReturnValue(undefined),
            )

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ acceptsSexOffenders: 'notRelevant' }),
            )
          })
        })

        describe('apType', () => {
          it.each<[MatchingInformationBody['apType'], BackwardsCompatibleApplyApType]>([
            ['normal', 'normal'],
            ['normal', 'standard'],
            ['isESAP', 'esap'],
            ['isMHAPElliottHouse', 'mhapElliottHouse'],
            ['isMHAPStJosephs', 'mhapStJosephs'],
            ['isPIPE', 'pipe'],
            ['isRecoveryFocussed', 'rfap'],
          ])("is set to '%s' when `type` === '%s'", (assessValue, applyValue) => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, SelectApType, 'type')
              .mockReturnValue(applyValue)

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ apType: assessValue }),
            )
          })
        })

        describe('isArsonSuitable', () => {
          it("is set to 'essential' when `arson` === 'yes'", () => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, Arson, 'arson')
              .mockReturnValue('yes')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isArsonSuitable: 'essential' }),
            )
          })

          it("is set to 'notRelevant' when `arson` === 'no'", () => {
            when(retrieveQuestionResponseFromFormArtifact).calledWith(application, Arson, 'arson').mockReturnValue('no')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isArsonSuitable: 'notRelevant' }),
            )
          })
        })

        describe('isCatered', () => {
          it("is set to 'essential' when `catering` (self-catering) === 'no'", () => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, Catering, 'catering')
              .mockReturnValue('no')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isCatered: 'essential' }),
            )
          })

          it("is set to 'notRelevant' when `catering` (self-catering) === 'yes'", () => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, Catering, 'catering')
              .mockReturnValue('yes')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isCatered: 'notRelevant' }),
            )
          })
        })

        describe('isSingle', () => {
          const fieldsToCheck: Array<TaskListPageField> = [
            { name: 'boosterEligibility', page: Covid },
            { name: 'immunosuppressed', page: Covid },
            { name: 'riskToOthers', page: RoomSharing },
            { name: 'riskToStaff', page: RoomSharing },
            { name: 'sharingConcerns', page: RoomSharing },
            { name: 'traumaConcerns', page: RoomSharing },
          ]

          it.each(fieldsToCheck)("is set to 'essential' when `$name` === 'yes'", ({ name: testedField }) => {
            fieldsToCheck.forEach(({ name, page }) =>
              when(retrieveQuestionResponseFromFormArtifact)
                .calledWith(application, page, name)
                .mockReturnValue(testedField === name ? 'yes' : 'no'),
            )

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isSingle: 'essential' }),
            )
          })

          it("is set to 'notRelevant' when all relevant fields === 'no'", () => {
            fieldsToCheck.forEach(({ name, page }) =>
              when(retrieveQuestionResponseFromFormArtifact).calledWith(application, page, name).mockReturnValue('no'),
            )

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isSingle: 'notRelevant' }),
            )
          })
        })

        describe('isSuitableForVulnerable', () => {
          it("is set to 'relevant' when `exploitable` === 'yes'", () => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, Vulnerability, 'exploitable')
              .mockReturnValue('yes')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isSuitableForVulnerable: 'relevant' }),
            )
          })

          it("is set to 'notRelevant' when `exploitable` === 'no'", () => {
            when(retrieveQuestionResponseFromFormArtifact)
              .calledWith(application, Vulnerability, 'exploitable')
              .mockReturnValue('no')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isSuitableForVulnerable: 'notRelevant' }),
            )
          })
        })

        describe('isSuitedForSexOffenders', () => {
          truthyCurrentPreviousValues.forEach(value => {
            it.each(sexualOffencesFields)(
              `is set to 'essential' when \`%s\` === ['${value.join("', '")}']`,
              testedField => {
                sexualOffencesFields.forEach(field =>
                  when(retrieveOptionalQuestionResponseFromFormArtifact)
                    .calledWith(application, DateOfOffence, field)
                    .mockReturnValue(testedField === field ? value : undefined),
                )

                expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
                  expect.objectContaining({ isSuitedForSexOffenders: 'essential' }),
                )
              },
            )
          })

          it("is set to 'notRelevant' when all relevant fields === undefined", () => {
            sexualOffencesFields.forEach(field =>
              when(retrieveOptionalQuestionResponseFromFormArtifact)
                .calledWith(application, DateOfOffence, field)
                .mockReturnValue(undefined),
            )

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isSuitedForSexOffenders: 'notRelevant' }),
            )
          })
        })

        describe('isWheelchairDesignated', () => {
          it("is set to 'essential' when `needsWheelchair` === 'yes'", () => {
            when(retrieveOptionalQuestionResponseFromFormArtifact)
              .calledWith(application, AccessNeedsFurtherQuestions, 'needsWheelchair')
              .mockReturnValue('yes')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isWheelchairDesignated: 'essential' }),
            )
          })

          it("is set to 'notRelevant' when `needsWheelchair` === 'no'", () => {
            when(retrieveOptionalQuestionResponseFromFormArtifact)
              .calledWith(application, AccessNeedsFurtherQuestions, 'needsWheelchair')
              .mockReturnValue('no')

            expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
              expect.objectContaining({ isWheelchairDesignated: 'notRelevant' }),
            )
          })
        })
      })
    })

    describe('remapArsonAssessmentData', () => {
      it('copies the value of isArsonDesignated to isArsonSuitable if it not populated', () => {
        const matchingInformationBody: MatchingInformationBody = {
          ...bodyWithUndefinedValues,
          isArsonDesignated: 'essential',
          isWheelchairDesignated: 'desirable',
        }
        const assessmentData = {
          'matching-information': {
            'matching-information': matchingInformationBody,
          },
        }
        expect(remapArsonAssessmentData(assessmentData)).not.toEqual(assessmentData)
        expect(remapArsonAssessmentData(assessmentData)).toEqual({
          'matching-information': {
            'matching-information': { ...matchingInformationBody, isArsonSuitable: 'essential' },
          },
        })
      })

      it('leaves the value of isArsonSuitable if it is populated', () => {
        const matchingInformationBody: MatchingInformationBody = {
          ...bodyWithUndefinedValues,
          isArsonDesignated: 'essential',
          isWheelchairDesignated: 'desirable',
          isArsonSuitable: 'notRelevant',
        }
        const assessmentData = {
          'matching-information': {
            'matching-information': matchingInformationBody,
          },
        }
        expect(remapArsonAssessmentData(assessmentData)).toEqual(assessmentData)
      })
    })
  })

  describe('suggestedStaySummaryListOptions', () => {
    beforeEach(() => {
      ;(placementDurationFromApplication as jest.Mock).mockReturnValueOnce(12)
    })

    describe('if the release date is known', () => {
      describe('when the start date is the same as the release date', () => {
        it('returns the suggested stay from the application as summary list options, using the release date as the start date', () => {
          when(retrieveQuestionResponseFromFormArtifact)
            .calledWith(application, ReleaseDate, 'knowReleaseDate')
            .mockReturnValue('yes')
          when(retrieveQuestionResponseFromFormArtifact)
            .calledWith(application, PlacementDate, 'startDateSameAsReleaseDate')
            .mockReturnValue('yes')
          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(application, ReleaseDate)
            .mockReturnValue('2024-03-07T00:00:00Z')

          expect(suggestedStaySummaryListOptions(application)).toEqual({
            rows: [
              { key: { text: 'Placement duration' }, value: { text: '1 week, 5 days', classes: 'placement-duration' } },
              {
                key: { text: 'Dates of placement' },
                value: { text: 'Thu 7 Mar 2024 - Tue 19 Mar 2024', classes: 'dates-of-placement' },
              },
            ],
          })

          expect(placementDurationFromApplication).toHaveBeenCalledWith(application)
          expect(retrieveQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
            application,
            PlacementDate,
            'startDateSameAsReleaseDate',
          )
          expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(application, ReleaseDate)
        })
      })

      describe('when the start date is not the same as the release date', () => {
        it('returns the suggested stay from the application as summary list options, using the start date from the placement date screen', () => {
          when(retrieveQuestionResponseFromFormArtifact)
            .calledWith(application, ReleaseDate, 'knowReleaseDate')
            .mockReturnValue('yes')
          when(retrieveQuestionResponseFromFormArtifact)
            .calledWith(application, PlacementDate, 'startDateSameAsReleaseDate')
            .mockReturnValue('no')
          when(retrieveOptionalQuestionResponseFromFormArtifact)
            .calledWith(application, PlacementDate, 'startDate')
            .mockReturnValue('2024-05-07T00:00:00Z')

          expect(suggestedStaySummaryListOptions(application)).toEqual({
            rows: [
              { key: { text: 'Placement duration' }, value: { text: '1 week, 5 days', classes: 'placement-duration' } },
              {
                key: { text: 'Dates of placement' },
                value: { text: 'Tue 7 May 2024 - Sun 19 May 2024', classes: 'dates-of-placement' },
              },
            ],
          })

          expect(placementDurationFromApplication).toHaveBeenCalledWith(application)
          expect(retrieveQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
            application,
            PlacementDate,
            'startDateSameAsReleaseDate',
          )
          expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
            application,
            PlacementDate,
            'startDate',
          )
        })
      })
    })

    describe('if the release date is not  known', () => {
      it('returns only the placement duration row', () => {
        when(retrieveQuestionResponseFromFormArtifact)
          .calledWith(application, ReleaseDate, 'knowReleaseDate')
          .mockReturnValue('no')

        expect(suggestedStaySummaryListOptions(application)).toEqual({
          rows: [
            { key: { text: 'Placement duration' }, value: { text: '1 week, 5 days', classes: 'placement-duration' } },
          ],
        })

        expect(placementDurationFromApplication).toHaveBeenCalledWith(application)
        expect(retrieveQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
          application,
          ReleaseDate,
          'knowReleaseDate',
        )
      })
    })
  })
})
