import { createMock } from '@golevelup/ts-jest'
import * as drugAndAlcoholUtils from './drugAndAlcoholUtils'
import { card } from './index'
import { drugAndAlcoholTabController } from './drugAndAlcohol'
import { PersonService } from '../../services'
import { cas1OasysGroupFactory } from '../../testutils/factories'

const mockCardList = [card({ title: 'mock card' })]
const personService = createMock<PersonService>({})
const token = 'token'
const crn = 'crn'

const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

describe('Drug and Alcohol tab', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('drugAndAlcoholTabController', () => {
    it('should get Oasys supporting info and then render the cards', async () => {
      jest.spyOn(drugAndAlcoholUtils, 'drugAndAlcoholCards').mockReturnValue(mockCardList)
      personService.getOasysAnswers.mockResolvedValue(supportingInformation)

      const result = await drugAndAlcoholTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList })

      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'supportingInformation', [8, 9])
      expect(drugAndAlcoholUtils.drugAndAlcoholCards).toHaveBeenCalledWith(supportingInformation, 'success')
    })
  })
})
