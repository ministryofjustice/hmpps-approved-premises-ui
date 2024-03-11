import {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  allocationSummary,
  caseNotesFromAssessment,
  confirmationPageMessage,
  confirmationPageResult,
  formattedArrivalDate,
  getPage,
  getReviewNavigationItems,
  groupAssessmements,
  keyDetails,
  rejectionRationaleFromAssessmentResponses,
} from './utils'

import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import {
  acctAlertFactory,
  adjudicationFactory,
  applicationFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  personFactory,
  prisonCaseNotesFactory,
  userFactory,
} from '../../testutils/factories'

import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { getResponseForPage } from '../applications/getResponseForPage'
import { nameOrPlaceholderCopy } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { linkTo } from '../utils'
import applyPaths from '../../paths/apply'
import { getApplicationType } from '../applications/utils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../applications/utils')
jest.mock('../applications/getResponseForPage')
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
      const completedAssessments = assessmentSummaryFactory.buildList(2, { status: 'completed' })
      const pendingAssessments = assessmentSummaryFactory.buildList(3, { status: 'awaiting_response' })
      const activeAssessments = assessmentSummaryFactory.buildList(5, { status: 'not_started' })

      const assessments = [completedAssessments, pendingAssessments, activeAssessments].flat()

      expect(groupAssessmements(assessments)).toEqual({
        completed: completedAssessments,
        requestedFurtherInformation: pendingAssessments,
        awaiting: activeAssessments,
      })
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

  describe('getReviewNavigationItems', () => {
    it('returns an array of objects with the link and human readable text for each of the Apply pages', () => {
      expect(getReviewNavigationItems()).toEqual([{ href: '#first', text: 'First' }])
    })
  })

  describe('confirmationPageMessage', () => {
    const assessment = assessmentFactory.build()

    it('returns the release date copy if the decision is "releaseDate"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('accept')

      expect(confirmationPageMessage(assessment)).toMatchStringIgnoringWhitespace(
        "<p>We've notified the Probation practitioner that this application has been assessed as suitable.</p>",
      )
    })

    it('returns the rejection copy if the decision isnt "accept"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've sent you a confirmation email.</p>
        <p>We've notified the Probation practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>`)
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
      assessment.data = {}
      assessment.application.data['prison-information'] = {
        'case-notes': { adjudications },
      }

      expect(adjudicationsFromAssessment(assessment)).toEqual(adjudications)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.data = {}
      assessment.application.data['prison-information'] = {}

      expect(adjudicationsFromAssessment(assessment)).toEqual([])
    })
  })

  describe('caseNotesFromAssessment', () => {
    it('returns the caseNotes from the assessment', () => {
      const selectedCaseNotes = prisonCaseNotesFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.data = {}
      assessment.application.data['prison-information'] = {
        'case-notes': { selectedCaseNotes },
      }

      expect(caseNotesFromAssessment(assessment)).toEqual(selectedCaseNotes)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.data = {}
      assessment.application.data['prison-information'] = {}

      expect(caseNotesFromAssessment(assessment)).toEqual([])
    })
  })

  describe('acctAlertsFromAssessment', () => {
    it('returns the acctAlerts from the assessment', () => {
      const acctAlerts = acctAlertFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.data = {}
      assessment.application.data['prison-information'] = { 'case-notes': { acctAlerts } }

      expect(acctAlertsFromAssessment(assessment)).toEqual(acctAlerts)
    })

    it('if the comments property of an ACCT alert is undefined it returns an empty string', () => {
      const acctAlert1 = acctAlertFactory.build()
      const acctAlert2 = acctAlertFactory.build({ comment: undefined })
      const assessment = assessmentFactory.build()
      assessment.data = {}
      assessment.application.data['prison-information'] = {
        'case-notes': { acctAlerts: [acctAlert1, acctAlert2] },
      }

      expect(acctAlertsFromAssessment(assessment)).toEqual([acctAlert1, { ...acctAlert2, comment: '' }])
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.data = {}
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
            text: getApplicationType(assessment.application),
          },
        },
        {
          key: {
            text: 'Allocated To',
          },
          value: {
            text: assessment.allocatedToStaffMember?.name,
          },
        },
      ])
    })

    it('returns the summary list when the assessment does not have a staff member allocated', () => {
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: undefined,
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
            text: getApplicationType(assessment.application),
          },
        },
      ])
    })
  })

  describe('rejectionRationaleFromAssessmentResponses', () => {
    it('returns the rejectionRationale from the assessment when it exists', () => {
      const assessment = assessmentFactory.build()

      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({ Decision: 'some rationale' }))

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('some rationale')
    })

    it('returns an empty string when the rationale doesnt exists', () => {
      const assessment = assessmentFactory.build()

      ;(getResponseForPage as jest.Mock).mockImplementation(() => [])

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('')
    })
  })

  describe('keyDetails', () => {
    const person = personFactory.build()

    it('should return key details for an assessment when an arrival date is provided', () => {
      const application = applicationFactory.build({ arrivalDate: '2022-01-01', person })
      const assessment = assessmentFactory.build({ application })

      expect(keyDetails(assessment)).toEqual({
        header: {
          key: 'Name',
          value: nameOrPlaceholderCopy(person),
          showKey: false,
        },
        items: [
          {
            key: { text: 'CRN' },
            value: { text: application.person.crn },
          },
          {
            key: { text: 'Arrival Date' },
            value: {
              text: DateFormats.isoDateToUIDate(application.arrivalDate),
            },
          },
          {
            value: {
              html: linkTo(
                applyPaths.applications.show,
                { id: application.id },
                { text: 'View application (opens in new window)', attributes: { target: '_blank' } },
              ),
            },
          },
        ],
      })
    })

    it('should return key details for an assessment when an arrival date is not provided', () => {
      const application = applicationFactory.build({ arrivalDate: undefined, person })
      const assessment = assessmentFactory.build({ application })

      expect(keyDetails(assessment)).toEqual({
        header: {
          key: 'Name',
          value: nameOrPlaceholderCopy(person),
          showKey: false,
        },
        items: [
          {
            key: { text: 'CRN' },
            value: { text: application.person.crn },
          },
          {
            key: { text: 'Arrival Date' },
            value: {
              text: 'Not provided',
            },
          },
          {
            value: {
              html: linkTo(
                applyPaths.applications.show,
                { id: application.id },
                { text: 'View application (opens in new window)', attributes: { target: '_blank' } },
              ),
            },
          },
        ],
      })
    })
  })
})
