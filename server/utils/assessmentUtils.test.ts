import {
  daysSinceReceived,
  getStatus,
  formattedArrivalDate,
  awaitingAssessmentTableRows,
  formatDays,
  daysUntilDue,
  daysSinceInfoRequest,
  requestedFurtherInformationTableRows,
  completedTableRows,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  formatDaysUntilDueWithWarning,
  assessmentLink,
  getPage,
  assessmentSections,
  getTaskResponsesAsSummaryListItems,
} from './assessmentUtils'
import { DateFormats } from './dateUtils'
import paths from '../paths/assess'

import * as personUtils from './personUtils'
import * as applicationUtils from './applicationUtils'

import assessmentFactory from '../testutils/factories/assessment'
import clarificationNoteFactory from '../testutils/factories/clarificationNote'
import Assess from '../form-pages/assess'
import { UnknownPageError } from './errors'
import applicationFactory from '../testutils/factories/application'
import reviewSections from './reviewUtils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('./applicationUtils')
jest.mock('./checkYourAnswersUtils')
jest.mock('./personUtils')
jest.mock('./reviewUtils')

jest.mock('../form-pages/assess', () => {
  return {
    pages: { 'review-application': {}, 'sufficient-information': {} },
  }
})

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { 'basic-information': {}, 'type-of-ap': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [],
      },
    ],
  }
})

Assess.pages['review-application'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('assessmentUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('daysSinceReceived', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const assessment = assessmentFactory.createdXDaysAgo(10).build()

      expect(daysSinceReceived(assessment)).toEqual(10)
    })
  })

  describe('daysSinceInfoRequest', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const today = new Date()

      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4)
      const infoRequest = clarificationNoteFactory.build({ createdAt: DateFormats.dateObjToIsoDate(date) })
      const assessment = assessmentFactory.build({
        clarificationNotes: [clarificationNoteFactory.build(), infoRequest],
      })

      expect(daysSinceInfoRequest(assessment)).toEqual(4)
    })

    it('returns undefined if there are no info requests', () => {
      const assessment = assessmentFactory.build({ clarificationNotes: [] })

      expect(daysSinceInfoRequest(assessment)).toEqual(undefined)
    })
  })

  describe('formatDays', () => {
    it('returns the singular form if there is 1 day', () => {
      expect(formatDays(1)).toEqual('1 Day')
    })

    it('returns the plural form if there is more than 1 day', () => {
      expect(formatDays(22)).toEqual('22 Days')
    })

    it('returns N/A if the day in undefined', () => {
      expect(formatDays(undefined)).toEqual('N/A')
    })
  })

  describe('getStatus', () => {
    it('returns Not started for an assessment without data', () => {
      const assessment = assessmentFactory.build({ data: undefined })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--grey">Not started</strong>')
    })

    it('returns In Progress for an assessment with data and no decision', () => {
      const assessment = assessmentFactory.build({ decision: undefined })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--blue">In progress</strong>')
    })

    it('returns Completed for an assessment with data and a decision', () => {
      const assessment = assessmentFactory.build({ decision: 'accepted' })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag">Completed</strong>')
    })
  })

  describe('daysUntilDue', () => {
    it('returns the days until the assessment is due', () => {
      const assessment = assessmentFactory.createdXDaysAgo(2).build()

      expect(daysUntilDue(assessment)).toEqual(7)
    })
  })

  describe('formattedArrivalDate', () => {
    it('returns the formatted arrival date from the application', () => {
      const assessment = assessmentFactory.build()
      const getDateSpy = jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

      expect(formattedArrivalDate(assessment)).toEqual('1 Jan 2022')
      expect(getDateSpy).toHaveBeenCalledWith(assessment.application)
    })
  })

  describe('awaitingAssessmentTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build()

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(awaitingAssessmentTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { text: assessment.application.person.prisonName },
          { html: formatDaysUntilDueWithWarning(assessment) },
          { html: getStatus(assessment) },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('requestedInformationTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build({ clarificationNotes: clarificationNoteFactory.buildList(2) })

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(requestedFurtherInformationTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { text: formatDays(daysSinceReceived(assessment)) },
          { text: formatDays(daysSinceInfoRequest(assessment)) },
          { html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>` },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('completedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build()

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(completedTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { html: getStatus(assessment) },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('assessmentsApproachingDue', () => {
    it('returns the number of assessments where the due date is less than DUE_DATE_APPROACHING_WINDOW away', () => {
      const assessments = [
        assessmentFactory.createdXDaysAgo(1).build(),
        assessmentFactory.createdXDaysAgo(2).build(),
        assessmentFactory.createdXDaysAgo(9).build(),
        assessmentFactory.createdXDaysAgo(7).build(),
      ]

      expect(assessmentsApproachingDue(assessments)).toEqual(2)
    })
  })

  describe('assessmentsApproachingDueBadge', () => {
    it('returns blank when there are no assessments approaching the due date', () => {
      const assessments = assessmentFactory.buildList(2, {
        createdAt: DateFormats.dateObjToIsoDate(new Date()),
      })

      expect(assessmentsApproachingDueBadge(assessments)).toEqual('')
    })

    it('returns a badge when there are assessments approaching the due date', () => {
      const assessments = assessmentFactory.createdXDaysAgo(9).buildList(2)

      expect(assessmentsApproachingDueBadge(assessments)).toEqual(
        '<span id="notifications" class="moj-notification-badge">2<span class="govuk-visually-hidden"> assessments approaching due date</span></span>',
      )
    })
  })

  describe('formatDaysUntilDueWithWarning', () => {
    it('returns the number of days without a warning if the due date is not soon', () => {
      const assessment = assessmentFactory.build({
        createdAt: DateFormats.dateObjToIsoDate(new Date()),
      })

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual('9 Days')
    })

    it('returns the number of days with a warning if the due date is soon', () => {
      const assessment = assessmentFactory.createdXDaysAgo(8).build()

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual(
        '<strong class="assessments--index__warning">1 Day<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>',
      )
    })
  })

  describe('assessmentLink', () => {
    it('returns a link to an assessment', () => {
      const assessment = assessmentFactory.build({ id: '123', application: { person: { name: 'John Wayne' } } })

      expect(assessmentLink(assessment)).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({ id: '123' })}" data-cy-assessmentId="123">John Wayne</a>
      `)
    })
  })

  describe('getPage', () => {
    it('should return a page if it exists', () => {
      expect(getPage('review-application', 'first')).toEqual(FirstPage)
      expect(getPage('review-application', 'second')).toEqual(SecondPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('review-application', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('assessmentSections', () => {
    it('calls reviewSections with the supplied arguments', () => {
      const application = applicationFactory.build()

      assessmentSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems)
    })
  })

  describe('getTaskResponsesAsSummaryListItems', () => {
    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(getTaskResponsesAsSummaryListItems({ id: '42', title: '42', pages: {} }, application)).toEqual([])
    })

    it('returns the task responses as Summary List items', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(applicationUtils.getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application)).toEqual([
        {
          key: {
            text: 'title',
          },
          value: {
            text: 'response',
          },
        },
      ])
    })
  })
})
