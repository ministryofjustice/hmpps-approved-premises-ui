import { createMock } from '@golevelup/ts-jest'

import { fromPartial } from '@total-typescript/shoehorn'
import { AssessmentService } from '../../../../services'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SufficientInformationConfirm from './sufficientInformationConfirm'

import { assessmentFactory } from '../../../../testutils/factories'
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

  describe('when the page has not already been completed', () => {
    beforeEach(() => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(null)
    })

    itShouldHaveNextValue(
      new SufficientInformationConfirm({ confirm: 'yes' }, assessment),
      'sufficient-information-sent',
    )

    itShouldHaveNextValue(new SufficientInformationConfirm({ confirm: 'no' }, assessment), 'sufficient-information')
  })

  describe('when the page has already been completed', () => {
    beforeEach(() => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('yes')
    })

    itShouldHaveNextValue(new SufficientInformationConfirm({ confirm: 'yes' }, assessment), 'information-received')

    itShouldHaveNextValue(new SufficientInformationConfirm({ confirm: 'no' }, assessment), 'sufficient-information')
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
