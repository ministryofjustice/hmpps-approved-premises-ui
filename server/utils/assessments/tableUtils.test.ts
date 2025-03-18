import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'

import { assessmentSummaryFactory, personFactory, restrictedPersonFactory } from '../../testutils/factories'
import { daysSinceInfoRequest, daysSinceReceived, formatDays, formattedArrivalDate } from './dateUtils'
import {
  assessmentLink,
  assessmentTable,
  awaitingAssessmentTableRows,
  completedTableRows,
  emptyCell,
  requestedFurtherInformationTableRows,
  restrictedPersonCell,
} from './tableUtils'
import paths from '../../paths/assess'
import { crnCell, daysUntilDueCell, tierCell } from '../tableUtils'
import { AssessmentSortField, ApprovedPremisesAssessmentSummary as AssessmentSummary } from '../../@types/shared'
import { sortHeader } from '../sortHeader'
import { linkTo } from '../utils'
import { displayName } from '../personUtils'
import { AssessmentStatusTag } from './statusTag'

jest.mock('../applications/arrivalDateFromApplication')

describe('tableUtils', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const restrictedPerson = restrictedPersonFactory.build()

  describe('assessmentLink', () => {
    const assessment = assessmentSummaryFactory.build({
      id: '123',
      applicationId: '345',
      person,
    })

    it('returns a link to an assessment', () => {
      expect(assessmentLink(assessment, person)).toBe(
        linkTo(paths.assessments.show({ id: assessment.id }), {
          text: displayName(person),
          attributes: { 'data-cy-assessmentId': assessment.id, 'data-cy-applicationId': assessment.applicationId },
        }),
      )
    })

    it('allows custom text to be specified', () => {
      expect(assessmentLink(assessment, person, 'My Text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123" data-cy-applicationId="345">My Text</a>
      `)
    })

    it('allows custom text and hidden text to be specified', () => {
      expect(assessmentLink(assessment, person, 'My Text', 'and some hidden text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123" data-cy-applicationId="345">My Text <span class="govuk-visually-hidden">and some hidden text</span></a>
      `)
    })

    it('prefixes the persons name with "LAO" if the "restrictedPerson" flag is true', () => {
      const lao = personFactory.build({ isRestricted: true })
      expect(assessmentLink(assessment, lao)).toMatchStringIgnoringWhitespace(`
      <a href="${paths.assessments.show({
        id: '123',
      })}" data-cy-assessmentId="123" data-cy-applicationId="345">LAO: ${lao.name}</a>
      `)
    })
  })

  describe('assessmentTable', () => {
    const assessments = assessmentSummaryFactory.buildList(5)
    const sortBy = 'name'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://example.com'

    it('returns an awaiting_assessment table', () => {
      expect(assessmentTable('awaiting_assessment', assessments, sortBy, sortDirection, hrefPrefix)).toEqual({
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          sortHeader<AssessmentSortField>('Expected arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Current location',
          },
          sortHeader<AssessmentSortField>('Days until assessment due', 'dueAt', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
        ],
        rows: awaitingAssessmentTableRows(assessments),
      })
    })

    it('returns an awaiting_response table', () => {
      expect(assessmentTable('awaiting_response', assessments, sortBy, sortDirection, hrefPrefix)).toEqual({
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          {
            text: 'Current location',
          },
          sortHeader<AssessmentSortField>('Expected arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Days since received',
          },
          sortHeader<AssessmentSortField>('Days until assessment due', 'dueAt', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
        ],
        rows: requestedFurtherInformationTableRows(assessments),
      })
    })

    it('returns an completed table', () => {
      expect(assessmentTable('completed', assessments, sortBy, sortDirection, hrefPrefix)).toEqual({
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          sortHeader<AssessmentSortField>('Expected arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
        ],
        rows: completedTableRows(assessments),
      })
    })
  })

  describe('awaitingAssessmentTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentSummaryFactory.build()
      assessment.person = person
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(awaitingAssessmentTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment, person) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: formattedArrivalDate(assessment) },
          { text: person.prisonName },
          daysUntilDueCell(assessment, 'assessments--index__warning'),
          { html: new AssessmentStatusTag(assessment.status, assessment.decision).html() },
        ],
      ])
    })

    it('returns table rows for the assessments for a RestrictedPerson', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'awaiting_response' })
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
      assessment.person = restrictedPerson

      expect(awaitingAssessmentTableRows([assessment])).toEqual([
        [
          restrictedPersonCell(assessment.person),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
        ],
      ])
    })
  })

  describe('requestedInformationTableRows', () => {
    let assessment: AssessmentSummary
    beforeEach(() => {
      assessment = assessmentSummaryFactory.build()
    })

    it('returns table rows for the assessments for a FullPerson', () => {
      assessment = assessmentSummaryFactory.build({ status: 'awaiting_response' })
      assessment.person = person
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(requestedFurtherInformationTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment, person) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: person.prisonName },
          { text: formattedArrivalDate(assessment) },
          { text: formatDays(daysSinceReceived(assessment)) },
          { text: formatDays(daysSinceInfoRequest(assessment)) },
          { html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>` },
        ],
      ])
    })

    it('returns table rows for the assessments for a RestrictedPerson', () => {
      assessment = assessmentSummaryFactory.build({ status: 'awaiting_response' })
      assessment.person = restrictedPerson
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(requestedFurtherInformationTableRows([assessment])).toEqual([
        [
          restrictedPersonCell(assessment.person),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
          emptyCell(),
        ],
      ])
    })
  })

  describe('completedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'completed', person })

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(completedTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment, person) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: formattedArrivalDate(assessment) },
          { html: new AssessmentStatusTag(assessment.status, assessment.decision).html() },
        ],
      ])
    })

    it('returns table rows for the assessments for a RestrictedPerson', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'completed' })
      assessment.person = restrictedPerson
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(completedTableRows([assessment])).toEqual([
        [restrictedPersonCell(assessment.person), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
      ])
    })
  })
})
