import { when } from 'jest-when'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../utils/retrieveQuestionResponseFromFormArtifact'
import { applicationFactory } from '../../testutils/factories'
import { MatchingInformationBody } from '../assess/matchingInformation/matchingInformationTask/matchingInformation'
import {
  TaskListPageYesNoField,
  defaultMatchingInformationValues,
  sexualOffencesFields,
} from './defaultMatchingInformationValues'
import AccessNeedsFurtherQuestions from '../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'
import Catering from '../apply/risk-and-need-factors/further-considerations/catering'
import Arson from '../apply/risk-and-need-factors/further-considerations/arson'
import RoomSharing from '../apply/risk-and-need-factors/further-considerations/roomSharing'
import Covid from '../apply/risk-and-need-factors/access-and-healthcare/covid'
import DateOfOffence from '../apply/risk-and-need-factors/risk-management-features/dateOfOffence'

jest.mock('../../utils/retrieveQuestionResponseFromFormArtifact')

describe('defaultMatchingInformationValues', () => {
  const bodyWithUndefinedValues: MatchingInformationBody = {
    acceptsChildSexOffenders: undefined,
    acceptsHateCrimeOffenders: undefined,
    acceptsNonSexualChildOffenders: undefined,
    acceptsSexOffenders: undefined,
    apType: undefined,
    cruInformation: undefined,
    hasEnSuite: undefined,
    isArsonDesignated: undefined,
    isArsonSuitable: undefined,
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
    specialistSupportCriteria: undefined,
  }
  const application = applicationFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns an object with current or sensible default values for relevant fields', () => {
    const yesNoFieldsToMock: Array<TaskListPageYesNoField> = [
      { name: 'arson', page: Arson },
      { name: 'boosterEligibility', page: Covid },
      { name: 'catering', page: Catering, value: 'no' },
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

    sexualOffencesFields.forEach(field =>
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, DateOfOffence, field)
        .mockReturnValue(['current', 'previous']),
    )

    const body: MatchingInformationBody = {
      ...bodyWithUndefinedValues,
      lengthOfStayAgreed: 'no',
      lengthOfStayDays: '3',
      lengthOfStayWeeks: '3',
    }

    expect(defaultMatchingInformationValues(body, application)).toEqual({
      isArsonDesignated: 'essential',
      isCatered: 'essential',
      isSingle: 'essential',
      isSuitedForSexOffenders: 'essential',
      isWheelchairDesignated: 'essential',
      lengthOfStay: '24',
    })
  })

  describe('isArsonDesignated', () => {
    it('is set to the original value if defined', () => {
      expect(
        defaultMatchingInformationValues({ ...bodyWithUndefinedValues, isArsonDesignated: 'desirable' }, application),
      ).toEqual(expect.objectContaining({ isArsonDesignated: 'desirable' }))
    })

    it("is set to 'essential' when there's no original value and `arson` === 'yes'", () => {
      when(retrieveQuestionResponseFromFormArtifact).calledWith(application, Arson, 'arson').mockReturnValue('yes')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isArsonDesignated: 'essential' }),
      )
    })

    it("is set to 'notRelevant' when there's no original value and `arson` === 'no'", () => {
      when(retrieveQuestionResponseFromFormArtifact).calledWith(application, Arson, 'arson').mockReturnValue('no')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isArsonDesignated: 'notRelevant' }),
      )
    })
  })

  describe('isCatered', () => {
    it('is set to the original value if defined', () => {
      expect(
        defaultMatchingInformationValues({ ...bodyWithUndefinedValues, isCatered: 'desirable' }, application),
      ).toEqual(expect.objectContaining({ isCatered: 'desirable' }))
    })

    it("is set to 'essential' when there's no original value and `catering` (self-catering) === 'no'", () => {
      when(retrieveQuestionResponseFromFormArtifact).calledWith(application, Catering, 'catering').mockReturnValue('no')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isCatered: 'essential' }),
      )
    })

    it("is set to 'notRelevant' when there's no original value and `catering` (self-catering) === 'yes'", () => {
      when(retrieveQuestionResponseFromFormArtifact)
        .calledWith(application, Catering, 'catering')
        .mockReturnValue('yes')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isCatered: 'notRelevant' }),
      )
    })
  })

  describe('isSingle', () => {
    it('is set to the original value if defined', () => {
      expect(
        defaultMatchingInformationValues({ ...bodyWithUndefinedValues, isSingle: 'desirable' }, application),
      ).toEqual(expect.objectContaining({ isSingle: 'desirable' }))
    })

    const yesNoFieldsToCheck: Array<TaskListPageYesNoField> = [
      { name: 'boosterEligibility', page: Covid },
      { name: 'immunosuppressed', page: Covid },
      { name: 'riskToOthers', page: RoomSharing },
      { name: 'riskToStaff', page: RoomSharing },
      { name: 'sharingConcerns', page: RoomSharing },
      { name: 'traumaConcerns', page: RoomSharing },
    ]

    it.each(yesNoFieldsToCheck)(
      "is set to 'essential' when there's no original value and `$name` === 'yes",
      ({ name: testedField }) => {
        yesNoFieldsToCheck.forEach(({ name, page }) =>
          when(retrieveQuestionResponseFromFormArtifact)
            .calledWith(application, page, name)
            .mockReturnValue(testedField === name ? 'yes' : 'no'),
        )

        expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
          expect.objectContaining({ isSingle: 'essential' }),
        )
      },
    )

    it("is set to 'notRelevant' when there's no original value and all relevant fields === 'no'", () => {
      yesNoFieldsToCheck.forEach(({ name, page }) =>
        when(retrieveQuestionResponseFromFormArtifact).calledWith(application, page, name).mockReturnValue('no'),
      )

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isSingle: 'notRelevant' }),
      )
    })
  })

  describe('isSuitedForSexOffenders', () => {
    it('is set to the original value if defined', () => {
      expect(
        defaultMatchingInformationValues(
          { ...bodyWithUndefinedValues, isSuitedForSexOffenders: 'desirable' },
          application,
        ),
      ).toEqual(expect.objectContaining({ isSuitedForSexOffenders: 'desirable' }))
    })

    const truthyValues = [['current'], ['previous'], ['current', 'previous']]

    truthyValues.forEach(value => {
      it.each(sexualOffencesFields)(
        `is set to 'essential' when there's no original value and \`%s\` === ['${value.join("', '")}']`,
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

    it("is set to 'notRelevant' when there's no original value and all relevant fields === undefined", () => {
      sexualOffencesFields.forEach(field =>
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(application, DateOfOffence, field)
          .mockReturnValue(undefined),
      )

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isSingle: 'notRelevant' }),
      )
    })
  })

  describe('isWheelchairDesignated', () => {
    it('is set to the original value if defined', () => {
      expect(
        defaultMatchingInformationValues(
          { ...bodyWithUndefinedValues, isWheelchairDesignated: 'desirable' },
          application,
        ),
      ).toEqual(expect.objectContaining({ isWheelchairDesignated: 'desirable' }))
    })

    it("is set to 'essential' when there's no original value and `needsWheelchair` === 'yes'", () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, AccessNeedsFurtherQuestions, 'needsWheelchair')
        .mockReturnValue('yes')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isWheelchairDesignated: 'essential' }),
      )
    })

    it("is set to 'notRelevant' when there's no original value and `needsWheelchair` === 'no'", () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(application, AccessNeedsFurtherQuestions, 'needsWheelchair')
        .mockReturnValue('no')

      expect(defaultMatchingInformationValues(bodyWithUndefinedValues, application)).toEqual(
        expect.objectContaining({ isWheelchairDesignated: 'notRelevant' }),
      )
    })
  })

  describe('lengthOfStay', () => {
    it('is set to `undefined` when `lengthOfStayAgreed` is `undefined`', () => {
      expect(defaultMatchingInformationValues({ ...bodyWithUndefinedValues }, application)).toEqual(
        expect.objectContaining({ lengthOfStay: undefined }),
      )
    })

    it('is set to `undefined` when `lengthOfStayAgreed` === "yes"', () => {
      expect(
        defaultMatchingInformationValues({ ...bodyWithUndefinedValues, lengthOfStayAgreed: 'yes' }, application),
      ).toEqual(expect.objectContaining({ lengthOfStay: undefined }))
    })

    it('is set to `undefined` when `lengthOfStayAgreed` === "no" but `lengthOfStayDays` is `undefined`', () => {
      expect(
        defaultMatchingInformationValues(
          { ...bodyWithUndefinedValues, lengthOfStayAgreed: 'no', lengthOfStayDays: undefined },
          application,
        ),
      ).toEqual(expect.objectContaining({ lengthOfStay: undefined }))
    })

    it('is set to `undefined` when `lengthOfStayAgreed` === "no" and `lengthOfStayDays` is defined but `lengthOfStayWeeks` is not', () => {
      expect(
        defaultMatchingInformationValues(
          { ...bodyWithUndefinedValues, lengthOfStayAgreed: 'no', lengthOfStayWeeks: undefined },
          application,
        ),
      ).toEqual(expect.objectContaining({ lengthOfStay: undefined }))
    })

    it('is set to the total length of stay in days when `lengthOfStayAgreed` === "no" and both `lengthOfStayDays` and `lengthOfStayWeeks` are defined', () => {
      expect(
        defaultMatchingInformationValues(
          { ...bodyWithUndefinedValues, lengthOfStayAgreed: 'no', lengthOfStayDays: '3', lengthOfStayWeeks: '3' },
          application,
        ),
      ).toEqual(expect.objectContaining({ lengthOfStay: '24' }))
    })
  })
})
