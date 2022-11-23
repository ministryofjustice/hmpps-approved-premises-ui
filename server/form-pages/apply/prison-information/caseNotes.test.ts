import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { PersonService } from '../../../services'

import prisonCaseNotesFactory from '../../../testutils/factories/prisonCaseNotes'
import { DateFormats } from '../../../utils/dateUtils'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import CaseNotes, { caseNoteCheckbox } from './caseNotes'

jest.mock('../../../services/personService.ts')

describe('CaseNotes', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  let personService: DeepMocked<PersonService>

  const caseNotes = [
    prisonCaseNotesFactory.build({
      id: 'A',
      createdAt: DateFormats.formatApiDate(new Date(2020, 1, 0)),
      occurredAt: DateFormats.formatApiDate(new Date(2020, 0, 1)),
      sensitive: false,
      authorName: 'Dennis Ziemann',
      subType: 'some subtype',
      type: 'some type',
      note: 'a note',
    }),
    prisonCaseNotesFactory.build({
      id: 'B',
      createdAt: DateFormats.formatApiDate(new Date(2021, 1, 0)),
      occurredAt: DateFormats.formatApiDate(new Date(2021, 0, 1)),
      sensitive: false,
      authorName: 'Dennis Ziemann',
      subType: 'some subtype',
      type: 'some type',
      note: 'another note',
    }),
    prisonCaseNotesFactory.build({
      id: 'C',
      createdAt: DateFormats.formatApiDate(new Date(2022, 1, 0)),
      occurredAt: DateFormats.formatApiDate(new Date(2022, 0, 1)),
describe('caseNoteCheckbox', () => {
  it('should return a checkbox for a given case note', () => {
    const caseNote = prisonCaseNotesFactory.build({
      id: 'A',
      createdAt: DateFormats.formatApiDate(new Date(2020, 1, 0)),
      occurredAt: DateFormats.formatApiDate(new Date(2020, 0, 1)),
      sensitive: false,
      authorName: 'Dennis Ziemann',
      subType: 'some subtype',
      type: 'some type',
      note: 'a further note',
    }),
  ]
      note: 'a note',
    })

    expect(caseNoteCheckbox(caseNote, true)).toMatchStringIgnoringWhitespace(`
    <div class="govuk-checkboxes" data-module="govuk-checkboxes">
      <div class="govuk-checkboxes__item">
        <input type="checkbox" class="govuk-checkboxes__input" name="caseNoteIds" value="A" id="A" checked>
        <label class="govuk-label govuk-checkboxes__label" for="A">
          <span class="govuk-visually-hidden">Select case note from Friday 31 January 2020</span>
        </label>
      </div>
     </div>
    `)

    expect(caseNoteCheckbox(caseNote, false)).toMatchStringIgnoringWhitespace(`
    <div class="govuk-checkboxes" data-module="govuk-checkboxes">
        <div class="govuk-checkboxes__item">
          <input type="checkbox" class="govuk-checkboxes__input" name="caseNoteIds" value="A" id="A">
          <label class="govuk-label govuk-checkboxes__label" for="A">
            <span class="govuk-visually-hidden">Select case note from Friday 31 January 2020</span>
          </label>
        </div>
    </div>
    `)
  })
})

  describe('title', () => {
    expect(new CaseNotes({}, application).title).toBe('Prison information')
  })

  describe('body', () => {
    it('should strip unknown attributes from the body and marshal the IDs', () => {
      const page = new CaseNotes(
        { selectedCaseNotes: [caseNotes[0], caseNotes[1]], moreDetail: 'some detail', something: 'else' },
        application,
      )

      expect(page.body).toEqual({
        selectedCaseNotes: [caseNotes[0], caseNotes[1]],
        moreDetail: 'some detail',
        caseNoteIds: ['A', 'B'],
      })
    })
  })

  describe('initialize', () => {
    const getPrisonCaseNotesMock = jest.fn().mockResolvedValue(caseNotes)

    beforeEach(() => {
      personService = createMock<PersonService>({ getPrisonCaseNotes: getPrisonCaseNotesMock })
    })

    it('calls the getPrisonCaseNotes method on the with a token and the persons CRN', async () => {
      const page = await CaseNotes.initialize({}, application, 'some-token', { personService })

      expect(page.caseNotes).toEqual(caseNotes)

      expect(getPrisonCaseNotesMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('initializes the caseNotes class with the selected case notes', async () => {
      const page = await CaseNotes.initialize({ caseNoteIds: ['A'] }, application, 'some-token', { personService })

      expect(page.body).toEqual({
        caseNoteIds: ['A'],
        selectedCaseNotes: [caseNotes[0]],
      })
    })

    it('initializes the caseNotes class correctly when caseNoteIds is a string', async () => {
      const page = await CaseNotes.initialize({ caseNoteIds: 'A' }, application, 'some-token', { personService })

      expect(page.body).toEqual({
        caseNoteIds: ['A'],
        selectedCaseNotes: [caseNotes[0]],
      })
    })

    it('initializes correctly when caseNoteIds is not present', async () => {
      const page = await CaseNotes.initialize({}, application, 'some-token', { personService })

      expect(page.body).toEqual({
        caseNoteIds: [],
        selectedCaseNotes: [],
      })
    })
  })

  itShouldHaveNextValue(new CaseNotes({}, application), '')
  itShouldHavePreviousValue(new CaseNotes({}, application), '')

  describe('response', () => {
    const page = new CaseNotes({ selectedCaseNotes: caseNotes, moreDetail: 'some detail' }, application)

    expect(page.response()).toEqual({
      'Selected prison case notes that support this application': [
        {
          'Date created': 'Friday 31 January 2020',
          'Date occurred': 'Wednesday 1 January 2020',
          'Is the case note sensitive?': 'No',
          'Name of author': 'Dennis Ziemann',
          Note: 'a note',
          Subtype: 'some subtype',
          Type: 'some type',
        },
        {
          'Date created': 'Sunday 31 January 2021',
          'Date occurred': 'Friday 1 January 2021',
          'Is the case note sensitive?': 'No',
          'Name of author': 'Dennis Ziemann',
          Note: 'another note',
          Subtype: 'some subtype',
          Type: 'some type',
        },
        {
          'Date created': 'Monday 31 January 2022',
          'Date occurred': 'Saturday 1 January 2022',
          'Is the case note sensitive?': 'No',
          'Name of author': 'Dennis Ziemann',
          Note: 'a further note',
          Subtype: 'some subtype',
          Type: 'some type',
        },
      ],
      'Are there additional circumstances that have helped John Wayne do well in the past?': 'some detail',
    })
  })

  describe('checkBoxForCaseNoteId', () => {
    const page = new CaseNotes(
      { selectedCaseNotes: [caseNotes[0], caseNotes[1]], moreDetail: 'some detail' },
      application,
    )

    beforeEach(() => {
      page.caseNotes = caseNotes
    })

    it('should mark selected case notes as checked', () => {
      expect(page.checkBoxForCaseNoteId(caseNotes[0].id)).toEqual(caseNoteCheckbox(caseNotes[0], true))
      expect(page.checkBoxForCaseNoteId(caseNotes[1].id)).toEqual(caseNoteCheckbox(caseNotes[1], true))
      expect(page.checkBoxForCaseNoteId(caseNotes[2].id)).toEqual(caseNoteCheckbox(caseNotes[2], false))
    })

    it('should raise an error if the ID is not present in the list of case notes', () => {
      expect(() => page.checkBoxForCaseNoteId('foo')).toThrowError(
        `Case note with id foo not found for CRN ${application.person.crn}`,
      )
    })
  })

  describe('errors', () => {
    expect(new CaseNotes({}, application).errors()).toEqual({})
  })
})
