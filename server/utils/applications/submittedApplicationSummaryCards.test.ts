import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'
import { FormSection, SummaryListActionItem, UiTask } from '../../@types/ui'
import { applicationFactory, documentFactory } from '../../testutils/factories'
import { SumbmittedApplicationSummaryCards } from './submittedApplicationSummaryCards'
import { embeddedSummaryListItem } from './summaryListUtils/embeddedSummaryListItem'
import { linebreaksToParagraphs } from '../utils'
import { documentsFromApplication } from '../assessments/documentUtils'
import { getActionsForTaskId } from '../assessments/getActionsForTaskId'

jest.mock('../assessments/documentUtils')
jest.mock('../assessments/getActionsForTaskId')

describe('SumbmittedApplicationSummaryCards', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return a summary card for each section', () => {
    const section1 = createMock<FormSection>({
      title: 'Type of AP required',
      tasks: [
        createMock<UiTask>({
          title: 'Basic information',
          id: 'basic-information',
        }),
        createMock<UiTask>({
          title: 'Type of AP required',
          id: 'type-of-ap-required',
        }),
      ],
    })

    const section2 = createMock<FormSection>({
      title: 'Considerations for when the placement ends',
      tasks: [
        createMock<UiTask>({
          title: 'Add move on information',
          id: 'move-on-information',
        }),
      ],
    })

    const sections = [section1, section2]

    const application = applicationFactory.build({
      document: {
        'basic-information': [
          {
            'Is this an exceptional case?': 'Yes',
            'Have you agreed the case with a senior manager?': 'Yes',
          },
          {
            'Is the person transgender or do they have a transgender history?': 'No',
          },
          {
            'Parole eligibility date': 'Wednesday 24 April 2024',
            'Home Detention Curfew (HDC) date': 'No date supplied',
            'Licence expiry date': 'No date supplied',
            'Post sentence supervision (PSS) start date': 'No date supplied',
            'Post sentence supervision (PSS) end date': 'No date supplied',
            'Sentence expiry date': 'No date supplied',
          },
        ],
        'type-of-ap-required': [
          {
            'Which type of AP does the person require?': 'Standard AP',
          },
        ],
        'move-on-information': [
          {
            'Does this application require a different placement duration?': 'No',
          },
          {
            'Where is the person most likely to live when they move on from the AP?': 'BD1',
          },
          {
            'Are move on arrangements already in place for when the person leaves the AP?':
              'No - A DTR will be complete for the local council\r\nCAS3 will be completed \r\nfamily address to be assessed ',
          },
          {
            'What type of accommodation will the person have when they leave the AP?':
              'CAS3 (Community Accommodation Service) provided',
          },
        ],
      },
    })

    const cards = new SumbmittedApplicationSummaryCards(application, null, sections).response

    expect(cards).toEqual([
      {
        title: 'Type of AP required',
        tasks: [
          {
            card: {
              title: { text: 'Basic information', headingLevel: 2 },
              attributes: { 'data-cy-section': 'basic-information' },
            },
            rows: [
              { key: { text: 'Is this an exceptional case?' }, value: { html: '<p class="govuk-body">Yes</p>' } },
              {
                key: { text: 'Have you agreed the case with a senior manager?' },
                value: { html: '<p class="govuk-body">Yes</p>' },
              },
              {
                key: { text: 'Is the person transgender or do they have a transgender history?' },
                value: { html: '<p class="govuk-body">No</p>' },
              },
              {
                key: { text: 'Parole eligibility date' },
                value: { html: '<p class="govuk-body">Wednesday 24 April 2024</p>' },
              },
              {
                key: { text: 'Home Detention Curfew (HDC) date' },
                value: { html: '<p class="govuk-body">No date supplied</p>' },
              },
              { key: { text: 'Licence expiry date' }, value: { html: '<p class="govuk-body">No date supplied</p>' } },
              {
                key: { text: 'Post sentence supervision (PSS) start date' },
                value: { html: '<p class="govuk-body">No date supplied</p>' },
              },
              {
                key: { text: 'Post sentence supervision (PSS) end date' },
                value: { html: '<p class="govuk-body">No date supplied</p>' },
              },
              { key: { text: 'Sentence expiry date' }, value: { html: '<p class="govuk-body">No date supplied</p>' } },
            ],
          },
          {
            card: {
              title: { text: 'Type of AP required', headingLevel: 2 },
              attributes: { 'data-cy-section': 'type-of-ap-required' },
            },
            rows: [
              {
                key: { text: 'Which type of AP does the person require?' },
                value: { html: '<p class="govuk-body">Standard AP</p>' },
              },
            ],
          },
        ],
      },
      {
        title: 'Considerations for when the placement ends',
        tasks: [
          {
            card: {
              title: { text: 'Add move on information', headingLevel: 2 },
              attributes: { 'data-cy-section': 'move-on-information' },
            },
            rows: [
              {
                key: { text: 'Does this application require a different placement duration?' },
                value: { html: '<p class="govuk-body">No</p>' },
              },
              {
                key: { text: 'Where is the person most likely to live when they move on from the AP?' },
                value: { html: '<p class="govuk-body">BD1</p>' },
              },
              {
                key: { text: 'Are move on arrangements already in place for when the person leaves the AP?' },
                value: {
                  html: '<p class="govuk-body">No - A DTR will be complete for the local council<br />CAS3 will be completed <br />family address to be assessed </p>',
                },
              },
              {
                key: { text: 'What type of accommodation will the person have when they leave the AP?' },
                value: { html: '<p class="govuk-body">CAS3 (Community Accommodation Service) provided</p>' },
              },
            ],
          },
        ],
      },
    ])
  })

  it('should return an embedded summary list item when the response is multilevelled', () => {
    const section = createMock<FormSection>({
      title: 'My Section',
      tasks: [
        createMock<UiTask>({
          title: 'Task 1',
          id: 'task-1',
        }),
      ],
    })

    const application = applicationFactory.build({
      document: {
        'task-1': [
          {
            'Question 1': [
              {
                'Subquestion 1': 'Answer 1',
                'Subquestion 2': 'Answer 2',
              },
              {
                'Subquestion 3': 'Answer 3',
              },
            ],
          },
          {
            'Question 2': 'Answer',
          },
        ],
      },
    })

    const cards = new SumbmittedApplicationSummaryCards(application, null, [section]).response

    expect(cards[0].tasks[0].rows[0]).toEqual({
      key: { text: 'Question 1' },
      value: {
        html: embeddedSummaryListItem([
          {
            'Subquestion 1': 'Answer 1',
            'Subquestion 2': 'Answer 2',
          },
          {
            'Subquestion 3': 'Answer 3',
          },
        ]),
      },
    })
    expect(cards[0].tasks[0].rows[1]).toEqual({
      key: { text: 'Question 2' },
      value: {
        html: linebreaksToParagraphs('Answer'),
      },
    })
  })

  it('should add documents', () => {
    const section = createMock<FormSection>({
      title: 'My Section',
      tasks: [
        createMock<UiTask>({
          title: 'Documents',
          id: 'attach-required-documents',
        }),
      ],
    })

    const application = applicationFactory.build()
    const documents = documentFactory.buildList(2)

    when(documentsFromApplication).calledWith(application).mockReturnValue(documents)

    const cards = new SumbmittedApplicationSummaryCards(application, null, [section]).response

    expect(cards[0].tasks[0].rows).toEqual([
      {
        key: {
          html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-cy-documentId="${documents[0].id}">${documents[0].fileName}</a>`,
        },
        value: { text: documents[0].description },
      },
      {
        key: {
          html: `<a href="/applications/people/${application.person.crn}/documents/${documents[1].id}" data-cy-documentId="${documents[1].id}">${documents[1].fileName}</a>`,
        },
        value: { text: documents[1].description },
      },
    ])
  })

  it('should add actions for specific tasks when the assessment ID is provided', () => {
    const section = createMock<FormSection>({
      title: 'My Section',
      tasks: [
        createMock<UiTask>({
          title: 'Task 1',
          id: 'task-1',
        }),
      ],
    })

    const application = applicationFactory.build()
    const assessmentId = '123'

    const summaryListActionItems = { items: [createMock<SummaryListActionItem>()] }

    when(getActionsForTaskId).calledWith(section.tasks[0].id, assessmentId).mockReturnValue(summaryListActionItems)

    const cards = new SumbmittedApplicationSummaryCards(application, assessmentId, [section]).response

    expect(getActionsForTaskId).toHaveBeenCalledWith(section.tasks[0].id, assessmentId)

    expect(cards[0].tasks[0].card.actions).toEqual(summaryListActionItems)
  })

  it('should not call getActionsForTaskId when an assessment ID is not specified', () => {
    const section = createMock<FormSection>({
      title: 'My Section',
      tasks: [
        createMock<UiTask>({
          title: 'Task 1',
          id: 'task-1',
        }),
      ],
    })

    const application = applicationFactory.build()
    const cards = new SumbmittedApplicationSummaryCards(application, null, [section]).response

    expect(getActionsForTaskId).not.toHaveBeenCalled()
    expect(cards[0].tasks[0].card.actions).toEqual(undefined)
  })

  it('should handle offline applications, returning an empty array for task rows', () => {
    const section = createMock<FormSection>({
      title: 'My Section',
      tasks: [
        createMock<UiTask>({
          title: 'Task 1',
          id: 'task-1',
        }),
      ],
    })

    const application = applicationFactory.build({ type: 'offline', document: undefined, status: undefined })
    const cards = new SumbmittedApplicationSummaryCards(application, null, [section]).response

    cards.forEach(card => {
      card.tasks.forEach(task => {
        expect(task.rows).toEqual([])
      })
    })
  })
})
