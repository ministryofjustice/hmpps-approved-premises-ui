import {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  allocationSummary,
  assessmentSections,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  caseNotesFromAssessment,
  confirmationPageMessage,
  confirmationPageResult,
  formattedArrivalDate,
  getApplicationType,
  getPage,
  getReviewNavigationItems,
  getTaskResponsesAsSummaryListItems,
  groupAssessmements,
  rejectionRationaleFromAssessmentResponses,
  reviewApplicationSections,
} from './utils'
import { DateFormats } from '../dateUtils'

import * as applicationUtils from '../applications/utils'

import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import {
  acctAlertFactory,
  adjudicationFactory,
  applicationFactory,
  assessmentFactory,
  documentFactory,
  prisonCaseNotesFactory,
  userFactory,
} from '../../testutils/factories'
import reviewSections from '../reviewUtils'
import { documentsFromApplication } from './documentUtils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { getActionsForTaskId } from './getActionsForTaskId'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../applications/utils')
jest.mock('../reviewUtils')
jest.mock('./documentUtils')
jest.mock('../applications/arrivalDateFromApplication')
jest.mock('./decisionUtils')
jest.mock('./getActionsForTaskId')

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'review-application': {}, 'sufficient-information': {} },
    sections: [
      {
        title: 'Review Application',
        name: 'ReviewApplication',
      },
      {
        title: 'Assess Application',
        name: 'AssessApplication',
      },
    ],
  }
})

jest.mock('../../form-pages/apply', () => {
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

describe('utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('groupAssessmements', () => {
    it('groups assessments by their status', () => {
      const completedAssessments = assessmentFactory.buildList(2, { status: 'completed' })
      const pendingAssessments = assessmentFactory.buildList(3, { status: 'awaiting_response' })
      const activeAssessments = assessmentFactory.buildList(5, { status: 'active' })

      const assessments = [completedAssessments, pendingAssessments, activeAssessments].flat()

      expect(groupAssessmements(assessments)).toEqual({
        completed: completedAssessments,
        requestedFurtherInformation: pendingAssessments,
        awaiting: activeAssessments,
      })
    })
  })

  describe('getApplicationType', () => {
    it('returns standard when the application is not PIPE', () => {
      ;(applicationUtils.getApplicationType as jest.Mock).mockReturnValue('Standard')
      const assessment = assessmentFactory.build({
        application: applicationFactory.build({ isPipeApplication: false }),
      })

      expect(getApplicationType(assessment)).toEqual('Standard')
    })

    it('returns PIPE when the application is PIPE', () => {
      ;(applicationUtils.getApplicationType as jest.Mock).mockReturnValue('PIPE')

      const assessment = assessmentFactory.build({
        application: applicationFactory.build({ isPipeApplication: true }),
      })

      expect(getApplicationType(assessment)).toEqual('PIPE')
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

  describe('reviewApplicationSections', () => {
    it('sends a cardActionFunction to reviewSections, which passes the correct assessment ID on to `getActionsForTaskId`', () => {
      const application = applicationFactory.build()

      reviewApplicationSections(application, 'assessmentId')

      const { mock } = reviewSections as jest.Mock
      const cardActionFunction = mock.calls[0][3]

      cardActionFunction('task')

      expect(getActionsForTaskId).toHaveBeenCalledWith('task', 'assessmentId')
    })
  })

  describe('assessmentSections', () => {
    it('calls reviewSections with showActions set to true as the default', () => {
      const assessment = assessmentFactory.build()

      assessmentSections(assessment)

      expect(reviewSections).toHaveBeenCalledWith(assessment, getTaskResponsesAsSummaryListItems, true)
    })

    it('allows showActions to be set to false', () => {
      const assessment = assessmentFactory.build()

      assessmentSections(assessment, false)

      expect(reviewSections).toHaveBeenCalledWith(assessment, getTaskResponsesAsSummaryListItems, false)
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

    describe('if the page name includes "attach-documents"', () => {
      it('then the correct array is returned', () => {
        const application = applicationFactory.build()
        const documents = documentFactory.buildList(1)

        ;(documentsFromApplication as jest.Mock).mockReturnValue(documents)

        application.data['attach-required-documents'] = {
          'attach-documents': {
            selectedDocuments: documents,
          },
        }

        expect(
          getTaskResponsesAsSummaryListItems({ id: 'attach-required-documents', title: 'bar', pages: {} }, application),
        ).toEqual([
          {
            key: {
              html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-cy-documentId="${documents[0].id}" />${documents[0].fileName}</a>`,
            },
            value: {
              text: documents[0].description,
            },
          },
        ])
      })
    })
  })

  describe('getReviewNavigationItems', () => {
    it('returns an array of objects with the link and human readable text for each of the Apply pages', () => {
      expect(getReviewNavigationItems()).toEqual([{ href: '#first', text: 'First' }])
    })
  })

  describe('confirmationPageMessage', () => {
    const assessment = assessmentFactory.build()

    it('returns the release date copy if the decision is "releaseDate"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('releaseDate')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
      <p>The assessment can now be used to match ${assessment.application.person.name} to a bed in an Approved Premises.</p>`)
    })

    it('returns the hold copy if the decision is "hold"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('hold')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
        <p>This case is now paused until the oral hearing outcome has been provided by the Probation Practitioner and a release date is confirmed.</p>
        <p>It will be added to the matching queue if the oral hearing is successful.</p>`)
    })

    it('returns the rejection copy if the decision isnt "hold" or "releaseDate" ', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've sent you a confirmation email.</p>
        <p>We've notified the Probation Practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>`)
    })
  })

  describe('confirmationPageResult', () => {
    const assessment = assessmentFactory.build()

    it('returns suitable copy if the application has been accepted"', () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(true)

      expect(confirmationPageResult(assessment)).toBe('You have marked this application as suitable.')
    })

    it('returns suitable copy if the application has not been accepted"', () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(false)

      expect(confirmationPageResult(assessment)).toBe('You have marked this application as unsuitable.')
    })
  })

  describe('adjudicationsFromAssessment', () => {
    it('returns the adjudications from the assessment', () => {
      const adjudications = adjudicationFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { adjudications } }

      expect(adjudicationsFromAssessment(assessment)).toEqual(adjudications)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(adjudicationsFromAssessment(assessment)).toEqual([])
    })
  })

  describe('caseNotesFromAssessment', () => {
    it('returns the caseNotes from the assessment', () => {
      const selectedCaseNotes = prisonCaseNotesFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { selectedCaseNotes } }

      expect(caseNotesFromAssessment(assessment)).toEqual(selectedCaseNotes)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(caseNotesFromAssessment(assessment)).toEqual([])
    })
  })

  describe('acctAlertsFromAssessment', () => {
    it('returns the acctAlerts from the assessment', () => {
      const acctAlerts = acctAlertFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { acctAlerts } }

      expect(acctAlertsFromAssessment(assessment)).toEqual(acctAlerts)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(acctAlertsFromAssessment(assessment)).toEqual([])
    })
  })

  describe('allocationSummary', () => {
    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
    })

    it('returns the summary list when the assessment has a staff member allocated', () => {
      const staffMember = userFactory.build()
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: staffMember,
      })

      expect(allocationSummary(assessment)).toEqual([
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: assessment.application.person.crn,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: formattedArrivalDate(assessment),
          },
        },
        {
          key: {
            text: 'Application Type',
          },
          value: {
            text: getApplicationType(assessment),
          },
        },
        {
          key: {
            text: 'Allocated To',
          },
          value: {
            text: assessment.allocatedToStaffMember.name,
          },
        },
      ])
    })

    it('returns the summary list when the assessment does not have a staff member allocated', () => {
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: null,
      })

      expect(allocationSummary(assessment)).toEqual([
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: assessment.application.person.crn,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: formattedArrivalDate(assessment),
          },
        },
        {
          key: {
            text: 'Application Type',
          },
          value: {
            text: getApplicationType(assessment),
          },
        },
      ])
    })
  })

  describe('rejectionRationaleFromAssessmentResponses', () => {
    it('returns the rejectionRationale from the assessment when it exists', () => {
      const assessment = assessmentFactory.build()

      ;(applicationUtils.getResponseForPage as jest.Mock).mockImplementation(() => ({ Decision: 'some rationale' }))

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('some rationale')
    })

    it('returns an empty string when the rationale doesnt exists', () => {
      const assessment = assessmentFactory.build()

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('')
    })
  })
})
