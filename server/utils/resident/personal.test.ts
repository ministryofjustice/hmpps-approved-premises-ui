import { createMock } from '@golevelup/ts-jest'
import { cas1SpaceBookingFactory, caseDetailFactory, risksFactory } from '../../testutils/factories'
import { contactsTabController, personalDetailsTabController } from './personal'
import { PersonService } from '../../services'
import * as personalUtils from './personalUtils'
import * as utils from './index'
import { card } from '.'

const personService = createMock<PersonService>({})
const token = 'token'
const placement = cas1SpaceBookingFactory.build()
const caseDetail = caseDetailFactory.build()
const personRisks = risksFactory.build()

const { crn } = placement.person

describe('Personal tab', () => {
  describe('personalDetailsTabController', () => {
    it('should render the personal details tab content', async () => {
      personService.findByCrn.mockResolvedValue(placement.person)
      personService.riskProfile.mockResolvedValue(personRisks)
      const mockCardList = [card({ title: 'mock card' })]

      jest.spyOn(personalUtils, 'personDetailsCardList').mockReturnValue(mockCardList)

      const result = await personalDetailsTabController({
        personService,
        token,
        crn,
        placement,
        caseDetail,
      })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Personal details' })
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personalUtils.personDetailsCardList).toHaveBeenCalledWith(placement.person, personRisks)
    })
  })

  describe('contactsTabController', () => {
    it('should render the contacts tab content', async () => {
      jest.spyOn(utils, 'ndeliusDeeplink').mockReturnValue('NDelius deeplink')
      jest.spyOn(utils, 'insetText').mockImplementation(text => `inset("${text}")`)
      jest.spyOn(personalUtils, 'contactsCardList').mockReturnValue([])

      const { subHeading, cardList } = await contactsTabController({ crn, caseDetail, caseDetailOutcome: 'success' })

      expect(subHeading).toMatch('Contact')
      expect(cardList).toEqual([])

      expect(personalUtils.contactsCardList).toHaveBeenCalledWith(caseDetail, 'success', crn)
    })
  })
})
