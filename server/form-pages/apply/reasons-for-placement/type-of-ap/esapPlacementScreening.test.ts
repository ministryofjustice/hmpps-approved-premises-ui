import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { convertKeyValuePairToCheckBoxItems, flattenCheckboxInput } from '../../../../utils/formUtils'

import EsapPlacementScreening, { esapFactors, esapReasons } from './esapPlacementScreening'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { pageDataFromApplicationOrAssessment } from '../../../utils'

jest.mock('../../../../utils/formUtils')
jest.mock('../../../utils')
;(flattenCheckboxInput as jest.MockedFunction<typeof flattenCheckboxInput>).mockImplementation(
  input => input as Array<string>,
)

describe('EsapPlacementScreening', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('title', () => {
    it('shold add the name of the person', () => {
      const page = new EsapPlacementScreening({}, application)

      expect(page.title).toEqual('Why does John Wayne require an enhanced security placement?')
    })
  })

  describe('when the user has answered the exceptional case question', () => {
    beforeEach(() => {
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({ agreedCaseWithCommunityHopp: 'yes' })
    })

    itShouldHavePreviousValue(new EsapPlacementScreening({}, application), 'esap-exceptional-case')
  })

  describe('when the user has not answered the exceptional case question', () => {
    beforeEach(() => {
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({})
    })

    itShouldHavePreviousValue(new EsapPlacementScreening({}, application), 'ap-type')
  })

  describe('next', () => {
    describe('when esapReasons includes `secreting`', () => {
      itShouldHaveNextValue(
        new EsapPlacementScreening({ esapReasons: ['secreting'] }, application),
        'esap-placement-secreting',
      )
    })

    describe('when esapReasons includes `cctv`', () => {
      itShouldHaveNextValue(new EsapPlacementScreening({ esapReasons: ['cctv'] }, application), 'esap-placement-cctv')
    })

    describe('when esapReasons includes `cctv` and `secreting`', () => {
      itShouldHaveNextValue(
        new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application),
        'esap-placement-secreting',
      )
    })
  })

  describe('response', () => {
    it('should translate the response correctly', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'] },
        application,
      )

      expect(page.response()).toEqual({
        'Why does John Wayne require an enhanced security placement?': [
          'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
          'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
        ],
        'Do any of the following factors also apply?': [
          'A diagnosis of autism or neurodiverse traits',
          'A complex personality presentation which has created challenges in the prison and where an AP PIPE is deemed unsuitable',
        ],
      })
    })

    it('should cope with missing factors', () => {
      const page = new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application)

      expect(page.response()).toEqual({
        'Why does John Wayne require an enhanced security placement?': [
          'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
          'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
        ],
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object when `esapReasons` is defined', () => {
      const page = new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error message when `esapReasons` is undefined', () => {
      const page = new EsapPlacementScreening({}, application)
      expect(page.errors()).toEqual({
        esapReasons: 'You must specify why John Wayne requires an enhanced security placement',
      })
    })

    it('should return an error message when `esapReasons` is empty', () => {
      const page = new EsapPlacementScreening({ esapReasons: [] }, application)
      expect(page.errors()).toEqual({
        esapReasons: 'You must specify why John Wayne requires an enhanced security placement',
      })
    })
  })

  describe('reasons', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'] },
        application,
      )
      page.reasons()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(esapReasons, page.body.esapReasons)
    })
  })

  describe('factors', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'] },
        application,
      )
      page.factors()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(esapFactors, page.body.esapFactors)
    })
  })
})
