import { createMock } from '@golevelup/ts-jest'
import { TaskNames, UiTask } from '@approved-premises/ui'
import { applicationFactory, assessmentFactory, documentFactory } from '../../testutils/factories'
import { forPagesInTask } from './forPagesInTask'
import { summaryListSections, taskResponsesAsSummaryListItems } from './summaryListUtils'
import reviewSections from '../reviewUtils'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getResponseForPage } from './getResponseForPage'
import TasklistPage from '../../form-pages/tasklistPage'
import { linebreaksToParagraphs } from '../utils'

jest.mock('../reviewUtils')
jest.mock('./utils')
jest.mock('./getResponseForPage')
jest.mock('./forPagesInTask')
jest.mock('../assessments/documentUtils')
jest.mock('../assessments/getActionsForTaskId')

describe('summaryListUtils', () => {
  describe('taskResponsesAsSummaryListItems', () => {
    const fooBarTask: UiTask = { id: 'foo' as TaskNames, title: 'bar', pages: {} }

    it('calls reviewSections with the correct arguments', () => {
      const application = applicationFactory.build()

      summaryListSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, taskResponsesAsSummaryListItems, true)
    })

    it('calls reviewSections with showActions if added', () => {
      const application = applicationFactory.build()

      summaryListSections(application, false)

      expect(reviewSections).toHaveBeenCalledWith(application, taskResponsesAsSummaryListItems, false)
    })

    it(`returns an empty array if there aren't any responses for the task`, () => {
      const application = applicationFactory.build()

      expect(taskResponsesAsSummaryListItems(fooBarTask, application, true)).toEqual([])
    })

    describe('when the document is an application', () => {
      it('returns the task responses as Summary List items and adds the actions object with a link to the application', () => {
        const application = applicationFactory.build()
        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'some-page')
        })
        application.data = { foo: ['bar'] }
        ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
          title: 'response',
        }))

        expect(taskResponsesAsSummaryListItems(fooBarTask, application, true)).toEqual([
          {
            actions: {
              items: [
                {
                  href: `/applications/${application.id}/tasks/foo/pages/some-page`,
                  text: 'Change',
                  visuallyHiddenText: 'title',
                },
              ],
            },
            key: {
              text: 'title',
            },
            value: {
              html: linebreaksToParagraphs('response'),
            },
          },
        ])
      })
    })

    describe('when the document is an assessment', () => {
      it('returns the task responses as Summary List items and adds the actions object with a link to the application', () => {
        const assessment = assessmentFactory.build()
        assessment.data = { foo: ['bar'] }
        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'some-page')
        })
        ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
          title: 'response',
        }))

        expect(taskResponsesAsSummaryListItems(fooBarTask, assessment, true)).toEqual([
          {
            actions: {
              items: [
                {
                  href: `/assessments/${assessment.id}/tasks/foo/pages/some-page`,
                  text: 'Change',
                  visuallyHiddenText: 'title',
                },
              ],
            },
            key: {
              text: 'title',
            },
            value: {
              html: linebreaksToParagraphs('response'),
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

      expect(taskResponsesAsSummaryListItems(fooBarTask, application, false)).toEqual([
        {
          key: {
            text: 'title',
          },
          value: {
            html: linebreaksToParagraphs('response'),
          },
        },
      ])
    })

    describe('if the page name includes "attach-documents"', () => {
      it('then the correct array is returned', () => {
        const application = applicationFactory.build()
        const documents = documentFactory.buildList(1)

        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'A question': 'An answer',
          })

          callback(page, 'attach-documents')
        })
        ;(documentsFromApplication as jest.Mock).mockReturnValue(documents)

        application.data['attach-required-documents'] = {
          'attach-documents': {
            selectedDocuments: documents,
          },
        }

        expect(taskResponsesAsSummaryListItems(fooBarTask, application)).toEqual([
          {
            key: {
              html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-debounce-link data-cy-documentId="${documents[0].id}">${documents[0].fileName}</a>`,
            },
            value: {
              text: documents[0].description,
            },

            actions: {
              items: [
                {
                  href: `/applications/${application.id}/tasks/foo/pages/attach-documents`,
                  text: 'Change',
                  visuallyHiddenText: documents[0].fileName,
                },
              ],
            },
          },
        ])
      })
    })
  })
})
