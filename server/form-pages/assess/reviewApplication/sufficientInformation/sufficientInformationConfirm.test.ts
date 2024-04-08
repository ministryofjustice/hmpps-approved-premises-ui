import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'
import { fromPartial } from '@total-typescript/shoehorn'

import { AssessmentService } from '../../../../services'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationConfirm from './sufficientInformationConfirm'

import { assessmentFactory, clarificationNoteFactory } from '../../../../testutils/factories'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('SufficientInformationConfirm', () => {
  const assessment = assessmentFactory.build()
  const assessmentService = createMock<AssessmentService>({})

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('title', () => {
    expect(new SufficientInformationConfirm({}, assessment).title).toBe(
      'Are you sure that you want to request more information about this application?',
    )
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SufficientInformationConfirm({ confirm: 'yes' }, assessment)
      expect(page.body).toEqual({ confirm: 'yes' })
    })
  })

  describe('initialize', () => {
    it('should initialize the page and not create a note when the body is not present', async () => {
      const body = {}
      const page = await SufficientInformationConfirm.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })

    it('should initialize the page and not create a note when confirm is no', async () => {
      const body = { confirm: 'no' }
      const page = await SufficientInformationConfirm.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })

    it('should initialize the page and create a note when confirm is yes and the page has not already been completed', async () => {
      const body = { confirm: 'yes' }
      const query = 'some text'

      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(null)
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(query)

      const page = await SufficientInformationConfirm.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).toHaveBeenCalledWith('token', assessment.id, { query })
    })

    it('should initialize the page and not create a note when confirm is yes and the page has already been completed', async () => {
      const body = { confirm: 'yes' }
      const query = 'some text'

      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(body.confirm)
      ;(retrieveQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(query)

      const page = await SufficientInformationConfirm.initialize(
        body,
        assessment,
        'token',
        fromPartial({ assessmentService }),
      )

      expect(page.body).toEqual(body)
      expect(assessmentService.createClarificationNote).not.toHaveBeenCalled()
    })
  })

  itShouldHavePreviousValue(new SufficientInformationConfirm({}, assessment), 'sufficient-information')

  describe('when the page has not been completed', () => {
    beforeEach(() => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(assessment, SufficientInformationConfirm, 'confirm')
        .mockReturnValue(null)
    })

    it('returns "sufficient-information-sent" when the answer is yes', () => {
      expect(new SufficientInformationConfirm({ confirm: 'yes' }, assessment).next()).toBe(
        'sufficient-information-sent',
      )
    })

    it('returns "sufficient-information" when the answer is no', () => {
      expect(new SufficientInformationConfirm({ confirm: 'no' }, assessment).next()).toBe('sufficient-information')
    })
  })

  describe('when the page has already been completed', () => {
    describe('when the response is "yes"', () => {
      when(retrieveOptionalQuestionResponseFromFormArtifact)
        .calledWith(assessment, SufficientInformationConfirm, 'confirm')
        .mockReturnValue('yes')

      expect(new SufficientInformationConfirm({ confirm: 'yes' }, assessment).next()).toBe('information-received')
    })

    describe('when the response is no', () => {
      describe('when there are clarificationNotes', () => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(assessment, SufficientInformationConfirm, 'confirm')
          .mockReturnValue('yes')

        const assessmentWithNotes = assessmentFactory.build({
          clarificationNotes: clarificationNoteFactory.buildList(1),
        })
        expect(new SufficientInformationConfirm({ confirm: 'no' }, assessmentWithNotes).next()).toBe('')
      })

      describe('when there arent clarificationNotes ', () => {
        when(retrieveOptionalQuestionResponseFromFormArtifact)
          .calledWith(assessment, SufficientInformationConfirm, 'confirm')
          .mockReturnValue('yes')

        const assessmentWithoutNotes = assessmentFactory.build({ clarificationNotes: [] })

        expect(new SufficientInformationConfirm({ confirm: 'no' }, assessmentWithoutNotes).next()).toBe(
          'sufficient-information',
        )
      })
    })
  })

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new SufficientInformationConfirm({}, assessment)

      expect(page.errors()).toEqual({
        confirm: 'You must confirm that you are sure that you want to request more information about this application',
      })
    })
  })

  describe('response', () => {
    it('should return blank', () => {
      const page = new SufficientInformationConfirm({ confirm: 'yes' }, assessment)

      expect(page.response()).toEqual({})
    })
  })
})
