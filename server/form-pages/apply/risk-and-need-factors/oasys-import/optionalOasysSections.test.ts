import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { ApplicationService, PersonService } from '../../../../services'
import applicationFactory from '../../../../testutils/factories/application'
import oasysSelectionFactory from '../../../../testutils/factories/oasysSelection'
import { sentenceCase } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import OptionalOasysSections from './optionalOasysSections'

jest.mock('../../../../services/personService.ts')

describe('OptionalOasysSections', () => {
  const oasysSelection = oasysSelectionFactory.buildList(3)
  const needsLinkedToHarm = oasysSelectionFactory.needsLinkedToHarm().buildList(2)

  const application = applicationFactory.build()

  describe('initialize', () => {
    const getOasysSelectionsMock = jest.fn().mockResolvedValue(oasysSelection)
    let personService: DeepMocked<PersonService>
    const applicationService = createMock<ApplicationService>({})

    const needsLinkedToReoffending = [
      oasysSelectionFactory.needsLinkedToReoffending().build({ section: 1 }),
      oasysSelectionFactory.needsLinkedToReoffending().build({ section: 2 }),
      oasysSelectionFactory.needsLinkedToReoffending().build({ section: 3 }),
    ]

    const otherNeeds = [
      oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 7 }),
      oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 8 }),
      oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 9 }),
    ]

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSelections: getOasysSelectionsMock,
      })

      getOasysSelectionsMock.mockResolvedValue([...needsLinkedToHarm, ...needsLinkedToReoffending, ...otherNeeds])
    })

    it('calls the getOasysSelections method on the client with a token and the persons CRN', async () => {
      await OptionalOasysSections.initialize({}, application, 'some-token', { personService, applicationService })

      expect(getOasysSelectionsMock).toHaveBeenCalledWith('some-token', application.person.crn)
    })

    it('filters the OASys sections into needs linked to reoffending and other needs not linked to reoffending or harm', async () => {
      const page = await OptionalOasysSections.initialize({}, application, 'some-token', {
        personService,
        applicationService,
      })

      expect(page.allNeedsLinkedToReoffending).toEqual(needsLinkedToReoffending)
      expect(page.allOtherNeeds).toEqual(otherNeeds)
    })

    it('returns an empty array for the selected needs if the body is empty', async () => {
      const page = await OptionalOasysSections.initialize({}, application, 'some-token', {
        personService,
        applicationService,
      })

      expect(page.body.needsLinkedToReoffending).toEqual([])
      expect(page.body.otherNeeds).toEqual([])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are a string', async () => {
      const page = await OptionalOasysSections.initialize(
        {
          needsLinkedToReoffending: needsLinkedToReoffending[0].section.toString(),
          otherNeeds: [otherNeeds[0].section.toString(), otherNeeds[1].section.toString()],
        },
        application,
        'some-token',
        {
          personService,
          applicationService,
        },
      )

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })

    it('initializes the OptionalOasysSections class with the selected sections when sections are section objects', async () => {
      const page = await OptionalOasysSections.initialize(
        { needsLinkedToReoffending: [needsLinkedToReoffending[0]], otherNeeds: [otherNeeds[0], otherNeeds[1]] },
        application,
        'some-token',
        {
          personService,
          applicationService,
        },
      )

      expect(page.body.needsLinkedToReoffending).toEqual([needsLinkedToReoffending[0]])
      expect(page.body.otherNeeds).toEqual([otherNeeds[0], otherNeeds[1]])
    })
  })

  itShouldHaveNextValue(new OptionalOasysSections({}), 'rosh-summary')

  itShouldHavePreviousValue(new OptionalOasysSections({}), 'dashboard')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new OptionalOasysSections({})
      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    const needLinkedToReoffendingA = oasysSelectionFactory
      .needsLinkedToReoffending()
      .build({ section: 1, name: 'Some section' })
    const needLinkedToReoffendingB = oasysSelectionFactory
      .needsLinkedToReoffending()
      .build({ section: 2, name: 'Some other Section' })
    const otherNeedA = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 3, name: 'Foo Section' })
    const otherNeedB = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 4, name: 'Bar Section' })

    describe('should return a translated version of the OASys sections', () => {
      it('when every need is selected', () => {
        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffendingA, needLinkedToReoffendingB],
          otherNeeds: [otherNeedA, otherNeedB],
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffendingA, needLinkedToReoffendingB]

        page.allOtherNeeds = [otherNeedA, otherNeedB]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: '1. Some section, 2. Some other section',
          [page.otherNeedsHeading]: '3. Foo section, 4. Bar section',
        })
      })

      it('when only one need is selected', () => {
        const needLinkedToReoffending = oasysSelectionFactory
          .needsLinkedToReoffending()
          .build({ section: 1, name: 'Some section' })
        const otherNeed = oasysSelectionFactory
          .needsNotLinkedToReoffending()
          .build({ section: 2, name: 'Some other section' })

        const page = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffending],
          otherNeeds: [otherNeed],
        })

        page.allNeedsLinkedToReoffending = [needLinkedToReoffending]
        page.allOtherNeeds = [otherNeed]

        expect(page.response()).toEqual({
          [page.needsLinkedToReoffendingHeading]: `1. Some section`,
          [page.otherNeedsHeading]: `2. Some other section`,
        })
      })

      it('returns an empty object when no needs are selected', () => {
        const page = new OptionalOasysSections({})
        expect(page.response()).toEqual({})
      })

      it('returns an object with only one key if only needsLinkedToReoffending or otherNeeds are given', () => {
        const needLinkedToReoffending = oasysSelectionFactory
          .needsLinkedToReoffending()
          .build({ section: 1, name: 'Some section' })

        const pageWithOnlyNeedsLinkedToReoffending = new OptionalOasysSections({
          needsLinkedToReoffending: [needLinkedToReoffending],
        })
        pageWithOnlyNeedsLinkedToReoffending.allNeedsLinkedToReoffending = [needLinkedToReoffending]

        expect(pageWithOnlyNeedsLinkedToReoffending.response()).toEqual({
          [pageWithOnlyNeedsLinkedToReoffending.needsLinkedToReoffendingHeading]: '1. Some section',
        })

        const otherNeed = oasysSelectionFactory
          .needsNotLinkedToReoffending()
          .build({ section: 2, name: 'Some other section' })

        const pageWithOnlyOtherNeeds = new OptionalOasysSections({
          otherNeeds: [otherNeed],
        })
        pageWithOnlyOtherNeeds.allOtherNeeds = [otherNeed]

        expect(pageWithOnlyOtherNeeds.response()).toEqual({
          [pageWithOnlyOtherNeeds.otherNeedsHeading]: '2. Some other section',
        })
      })
    })
  })

  describe('reoffendingNeedsItems', () => {
    it('it returns reoffending needs as checkbox items', () => {
      const needLinkedToReoffendingA = oasysSelectionFactory
        .needsLinkedToReoffending()
        .build({ section: 1, name: 'emotional' })
      const needLinkedToReoffendingB = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 2 })
      const needLinkedToReoffendingC = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 3 })

      const page = new OptionalOasysSections({ needsLinkedToReoffending: [needLinkedToReoffendingA] })
      page.allNeedsLinkedToReoffending = [needLinkedToReoffendingA, needLinkedToReoffendingB, needLinkedToReoffendingC]
      const items = page.reoffendingNeedsItems()

      expect(items).toEqual([
        {
          checked: true,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.name)}`,
          value: '1',
        },
        {
          checked: false,
          text: `2. ${sentenceCase(needLinkedToReoffendingB.name)}`,
          value: '2',
        },
        {
          checked: false,
          text: `3. ${sentenceCase(needLinkedToReoffendingC.name)}`,
          value: '3',
        },
      ])
    })
  })

  describe('otherNeedsItems', () => {
    it('it returns other needs as checkbox items', () => {
      const otherNeedA = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 1 })
      const otherNeedB = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 2, name: 'thinking' })
      const otherNeedC = oasysSelectionFactory.needsNotLinkedToReoffending().build({ section: 3 })

      const page = new OptionalOasysSections({ otherNeeds: [otherNeedB] })
      page.allOtherNeeds = [otherNeedA, otherNeedB, otherNeedC]

      const items = page.otherNeedsItems()

      expect(items).toEqual([
        {
          checked: false,
          text: `1. ${sentenceCase(otherNeedA.name)}`,
          value: '1',
        },
        {
          checked: true,
          text: `2. ${sentenceCase(otherNeedB.name)}`,
          value: '2',
        },
        {
          checked: false,
          text: `3. ${sentenceCase(otherNeedC.name)}`,
          value: '3',
        },
      ])
    })
  })
})
