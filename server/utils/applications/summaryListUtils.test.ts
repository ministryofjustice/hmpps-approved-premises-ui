import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import { getResponseForPage } from './utils'

import { embeddedSummaryListItem, getTaskResponsesAsSummaryListItems, summaryListSections } from './summaryListUtils'
import reviewSections from '../reviewUtils'

jest.mock('../reviewUtils')
jest.mock('./utils')

describe('summaryListUtils', () => {
  describe('embeddedSummaryListItem', () => {
    it('returns a summary list for an array of records', () => {
      const result = embeddedSummaryListItem([
        { foo: 'bar', bar: 'baz' },
        { foo: 'bar', bar: 'baz' },
      ]).replace(/\s+/g, ``)

      expect(result).toEqual(
        `
      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>`.replace(/\s+/g, ``),
      )
    })
  })

  describe('summaryListSections', () => {
    it('calls reviewSections with the correct arguments', () => {
      const application = applicationFactory.build()

      summaryListSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems, true)
    })

    it('calls reviewSections with showActions if added', () => {
      const application = applicationFactory.build()

      summaryListSections(application, false)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems, false)
    })
  })

  describe('getTaskResponsesAsSummaryListItems', () => {
    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(getTaskResponsesAsSummaryListItems({ id: '42', title: '42', pages: {} }, application, true)).toEqual([])
    })

    it('returns the task responses as Summary List items and adds the actions object', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application, true)).toEqual([
        {
          actions: {
            items: [
              {
                href: `/applications/${application.id}/tasks/foo/pages/0`,
                text: 'Change',
                visuallyHiddenText: 'title',
              },
            ],
          },
          key: {
            text: 'title',
          },
          value: {
            text: 'response',
          },
        },
      ])
    })

    describe('when the document is an assessment', () => {
      it('returns the task responses as Summary List items and adds the actions object with a link to the application', () => {
        const assessment = assessmentFactory.build()
        assessment.data = { foo: ['bar'] }
        ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
          title: 'response',
        }))

        expect(taskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, assessment, true)).toEqual([
          {
            actions: {
              items: [
                {
                  href: `/assessments/${assessment.id}/tasks/foo/pages/0`,
                  text: 'Change',
                  visuallyHiddenText: 'title',
                },
              ],
            },
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

    it('returns the task responses as Summary List items without the actions object if showActions is false', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application, false)).toEqual([
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
