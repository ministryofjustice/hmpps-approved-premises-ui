import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { ApplicationService, PersonService } from '../../../../services'

import {
  adjudicationFactory,
  applicationFactory,
  personFactory,
  prisonCaseNotesFactory,
} from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'

import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import CaseNotes, { adjudicationResponse, caseNoteCheckbox, caseNoteResponse } from './caseNotes'

jest.mock('../../../../services/personService.ts')

describe('caseNoteResponse', () => {
  it('returns a response for a case note', () => {
    const caseNote = prisonCaseNotesFactory.build({
      id: 'A',
      createdAt: DateFormats.dateObjToIsoDate(new Date(2020, 1, 0)),
      occurredAt: DateFormats.dateObjToIsoDate(new Date(2020, 0, 1)),
      sensitive: false,
      authorName: 'Dennis Ziemann',
      subType: 'some subtype',
      type: 'some type',
      note: 'a note',
    })

    expect(caseNoteResponse(caseNote)).toEqual({
      'Date created': 'Friday 31 January 2020',
      'Date occurred': 'Wednesday 1 January 2020',
      'Is the case note sensitive?': 'No',
      'Name of author': 'Dennis Ziemann',
      Note: 'a note',
      Subtype: 'some subtype',
      Type: 'some type',
    })
  })
})

describe('adjudicationResponse', () => {
  it('returns a response for an adjudication', () => {
    const adjudication = adjudicationFactory.build({
      id: 123,
      reportedAt: '2022-01-01T10:00:00Z',
      establishment: 'Some establishment',
      offenceDescription: 'Description',
      finding: 'NOT_PROVED',
    })

    expect(adjudicationResponse(adjudication)).toEqual({
      'Adjudication number': 123,
      Establishment: 'Some establishment',
      Finding: 'Not proved',
      'Offence description': 'Description',
      'Report date and time': '1 Jan 2022, 10:00',
    })
  })
})

describe('caseNoteCheckbox', () => {
  it('should return a checkbox for a given case note', () => {
    const caseNote = prisonCaseNotesFactory.build({
      id: 'A',
      createdAt: DateFormats.dateObjToIsoDate(new Date(2020, 1, 0)),
      occurredAt: DateFormats.dateObjToIsoDate(new Date(2020, 0, 1)),
      sensitive: false,
      authorName: 'Dennis Ziemann',
      subType: 'some subtype',
      type: 'some type',
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

describe('CaseNotes', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  let personService: DeepMocked<PersonService>
  const applicationService = createMock<ApplicationService>({})

  const adjudications = adjudicationFactory.buildList(5)
  const caseNotes = prisonCaseNotesFactory.buildList(3)

  describe('title', () => {
    expect(new CaseNotes({}, application).title).toBe('Prison information')
  })

  describe('body', () => {
    it('should set the body and marshal the IDs', () => {
      const page = new CaseNotes(
        {
          selectedCaseNotes: [caseNotes[0], caseNotes[1]],
          adjudications,
        },
        application,
      )

      expect(page.body).toEqual({
        selectedCaseNotes: [caseNotes[0], caseNotes[1]],
        acctAlerts: [],
        caseNoteIds: [caseNotes[0].id, caseNotes[1].id],
        adjudications,
      })
    })
  })

  describe('initialize', () => {
    const getPrisonCaseNotesMock = jest.fn().mockResolvedValue(caseNotes)
    const getAdjudicationsMock = jest.fn().mockResolvedValue(adjudications)

    beforeEach(() => {
      personService = createMock<PersonService>({
        getPrisonCaseNotes: getPrisonCaseNotesMock,
        getAdjudications: getAdjudicationsMock,
      })
    })

    it('calls the getPrisonCaseNotes method on the with a token and the persons CRN', async () => {
      const page = await CaseNotes.initialize({}, application, 'some-token', { personService, applicationService })

      expect(page.caseNotes).toEqual(caseNotes)

      expect(getPrisonCaseNotesMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('calls the getAdjudications method on the with a token and the persons CRN', async () => {
      const page = await CaseNotes.initialize({}, application, 'some-token', { personService, applicationService })

      expect(page.caseNotes).toEqual(caseNotes)

      expect(getAdjudicationsMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('initializes the caseNotes class with the selected case notes and adjudications', async () => {
      const page = await CaseNotes.initialize({ caseNoteIds: [caseNotes[0].id] }, application, 'some-token', {
        personService,
        applicationService,
      })

      expect(page.body).toEqual({
        caseNoteIds: [caseNotes[0].id],
        selectedCaseNotes: [caseNotes[0]],
        adjudications,
      })
    })

    it('initializes the caseNotes class correctly when caseNoteIds is a string', async () => {
      const page = await CaseNotes.initialize({ caseNoteIds: caseNotes[0].id }, application, 'some-token', {
        personService,
        applicationService,
      })

      expect(page.body).toEqual({
        caseNoteIds: [caseNotes[0].id],
        selectedCaseNotes: [caseNotes[0]],
        adjudications,
      })
    })

    it('initializes correctly when caseNoteIds is not present', async () => {
      const page = await CaseNotes.initialize({}, application, 'some-token', { personService, applicationService })

      expect(page.body).toEqual({
        caseNoteIds: [],
        selectedCaseNotes: [],
        adjudications,
      })
    })
  })

  itShouldHaveNextValue(new CaseNotes({}, application), '')
  itShouldHavePreviousValue(new CaseNotes({}, application), 'dashboard')

  describe('response', () => {
    const page = new CaseNotes({ selectedCaseNotes: caseNotes, adjudications }, application)

    expect(page.response()).toEqual({
      'Selected prison case notes that support this application': [
        caseNoteResponse(caseNotes[0]),
        caseNoteResponse(caseNotes[1]),
        caseNoteResponse(caseNotes[2]),
      ],
      Adjudications: [
        adjudicationResponse(adjudications[0]),
        adjudicationResponse(adjudications[1]),
        adjudicationResponse(adjudications[2]),
        adjudicationResponse(adjudications[3]),
        adjudicationResponse(adjudications[4]),
      ],
    })
  })

  describe('checkBoxForCaseNoteId', () => {
    const page = new CaseNotes({ selectedCaseNotes: [caseNotes[0], caseNotes[1]] }, application)

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
