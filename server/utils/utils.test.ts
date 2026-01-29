import { path } from 'static-path'
import type { SummaryListItem } from '@approved-premises/ui'
import { PersonRisks } from '@approved-premises/api'
import {
  camelCase,
  convertToTitleCase,
  initialiseName,
  isCardinal,
  joinWithCommas,
  linebreaksToParagraphs,
  linkTo,
  makeArrayOfType,
  mapApiPersonRisksForUi,
  numberToOrdinal,
  objectClean,
  objectIfNotEmpty,
  pascalCase,
  pluralize,
  removeBlankSummaryListItems,
  resolvePath,
  settlePromises,
  settlePromisesWithOutcomes,
} from './utils'
import { risksFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import { ErrorWithData } from './errors'

describe('utils', () => {
  describe('convert to title case', () => {
    it.each([
      [null, null, ''] as unknown as Array<string>,
      ['empty string', '', ''],
      ['Lower case', 'robert', 'Robert'],
      ['Upper case', 'ROBERT', 'Robert'],
      ['Mixed case', 'RoBErT', 'Robert'],
      ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
      ['Leading spaces', '  RobeRT', '  Robert'],
      ['Trailing spaces', 'RobeRT  ', 'Robert  '],
      ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
    ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
      expect(convertToTitleCase(a)).toEqual(expected)
    })
  })

  describe('pascalCase', () => {
    it('converts a string to Pascal Case', () => {
      expect(pascalCase('my-string')).toEqual('MyString')
    })
  })

  describe('camelCase', () => {
    it('converts a string to camel Case', () => {
      expect(camelCase('my-string')).toEqual('myString')
    })
  })

  describe('initialise name', () => {
    it.each([
      [null, null, null] as unknown as Array<string>,
      ['Empty string', '', null] as unknown as Array<string>,
      ['One word', 'robert', 'r. robert'],
      ['Two words', 'Robert James', 'R. James'],
      ['Three words', 'Robert James Smith', 'R. Smith'],
      ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
    ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
      expect(initialiseName(a)).toEqual(expected)
    })
  })

  describe('removeBlankSummaryListItems', () => {
    it('removes all blank and undefined items', () => {
      const items = [
        {
          key: {
            text: 'Names',
          },
          value: {
            text: 'Name',
          },
        },
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: '',
          },
        },
        {
          key: {
            text: 'Date of Birth',
          },
          value: {
            text: undefined,
          },
        },
        {
          key: {
            text: 'NOMIS Number',
          },
          value: {
            html: '<strong>Some HTML</strong>',
          },
        },
        {
          key: {
            text: 'Nationality',
          },
          value: {
            html: undefined,
          },
        },
        {
          key: {
            text: 'Religion',
          },
          value: {
            html: '',
          },
        },
      ] as Array<SummaryListItem>

      expect(removeBlankSummaryListItems(items)).toEqual([
        {
          key: {
            text: 'Names',
          },
          value: {
            text: 'Name',
          },
        },
        {
          key: {
            text: 'NOMIS Number',
          },
          value: {
            html: '<strong>Some HTML</strong>',
          },
        },
      ])
    })
  })

  describe('mapApiPersonRiskForUI', () => {
    let risks: PersonRisks

    beforeEach(() => {
      risks = risksFactory.build()
    })

    it('maps the PersonRisks from the API into a shape thats useful for the UI', () => {
      const actual = mapApiPersonRisksForUi(risks)

      expect(actual).toEqual({
        crn: risks.crn,
        flags: risks.flags.value,
        mappa: {
          lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
          level: risks.mappa.value.level,
          status: risks.mappa.status,
        },
        roshRisks: {
          lastUpdated: DateFormats.isoDateToUIDate(risks.roshRisks.value.lastUpdated),
          overallRisk: risks.roshRisks.value.overallRisk,
          riskToChildren: risks.roshRisks.value.riskToChildren,
          riskToKnownAdult: risks.roshRisks.value.riskToKnownAdult,
          riskToPublic: risks.roshRisks.value.riskToPublic,
          riskToStaff: risks.roshRisks.value.riskToStaff,
        },
        tier: {
          lastUpdated: DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated),
          level: risks.tier.value.level,
        },
      })
    })

    it('handles the case where roshRisks is null', () => {
      risks.roshRisks = null as unknown as PersonRisks['roshRisks']

      const actual = mapApiPersonRisksForUi(risks)

      expect(actual).toEqual(
        expect.objectContaining({
          roshRisks: {
            lastUpdated: '',
          },
        }),
      )
    })

    it('handles the case where mappa is null', () => {
      risks.mappa = null as unknown as PersonRisks['mappa']

      const actual = mapApiPersonRisksForUi(risks)

      expect(actual).toEqual(
        expect.objectContaining({
          mappa: {
            status: undefined,
            lastUpdated: '',
          },
        }),
      )
    })

    it('handles the case where tier is null', () => {
      risks.tier = null as unknown as PersonRisks['tier']

      const actual = mapApiPersonRisksForUi(risks)

      expect(actual).toEqual(
        expect.objectContaining({
          tier: {
            lastUpdated: '',
          },
        }),
      )
    })

    it('handles the case where flags is null', () => {
      risks.flags.value = null as unknown as PersonRisks['flags']['value']

      const actual = mapApiPersonRisksForUi(risks)

      expect(actual).toEqual(
        expect.objectContaining({
          flags: null,
        }),
      )
    })
  })

  describe('linkTo', () => {
    it('returns a generic link', () => {
      expect(linkTo(path('/foo')({}), { text: 'Hello' })).toMatchStringIgnoringWhitespace('<a href="/foo">Hello</a>')
    })

    it('allows params to be specified', () => {
      expect(linkTo(path('/foo/:id')({ id: '123' }), { text: 'Hello' })).toMatchStringIgnoringWhitespace(
        '<a href="/foo/123">Hello</a>',
      )
    })

    it('allows hidden text to be specified', () => {
      expect(
        linkTo(path('/foo/:id')({ id: '123' }), { text: 'Hello', hiddenText: 'Hidden' }),
      ).toMatchStringIgnoringWhitespace('<a href="/foo/123">Hello<span class="govuk-visually-hidden">Hidden</span></a>')
    })

    it('allows hidden prefix text to be specified', () => {
      expect(
        linkTo(path('/foo/:id')({ id: '123' }), { text: 'Hello', hiddenPrefix: 'Hidden' }),
      ).toMatchStringIgnoringWhitespace('<a href="/foo/123"><span class="govuk-visually-hidden">Hidden</span>Hello</a>')
    })

    it('allows attributes to be specified', () => {
      expect(
        linkTo(path('/foo/:id')({ id: '123' }), { text: 'Hello', attributes: { class: 'some-class' } }),
      ).toMatchStringIgnoringWhitespace('<a href="/foo/123" class="some-class">Hello</a>')
    })

    it('allows a query to be passed', () => {
      expect(linkTo(path('/foo')({}), { text: 'Hello', query: { foo: 'bar' } })).toMatchStringIgnoringWhitespace(
        '<a href="/foo?foo=bar">Hello</a>',
      )
    })

    it('returns a link that will open in a new tab', () => {
      expect(
        linkTo(path('/foo')({}), { text: 'Hello', query: { foo: 'bar' }, openInNewTab: true }),
      ).toMatchStringIgnoringWhitespace('<a href="/foo?foo=bar" target="_blank">Hello</a>')
    })
  })

  describe('resolvePath', () => {
    it('returns a property when passed an object and a path', () => {
      const object = { foo: { bar: 'baz' } }
      expect(resolvePath(object, 'foo.bar')).toEqual('baz')
      expect(resolvePath(object, 'foo[bar]')).toEqual('baz')
    })

    it('returns undefined when passed an object and a path and the property isnt found', () => {
      const object = { foo: { bar: 'baz' } }

      expect(resolvePath(object, 'foo.baz')).toEqual(undefined)
    })

    describe('objectIfNotEmpty', () => {
      it('returns undefined if the object does not have keys', () => {
        expect(objectIfNotEmpty({})).toBeUndefined()
      })

      it('returns the object if it does have keys', () => {
        expect(objectIfNotEmpty({ key: 'value' })).toEqual({ key: 'value' })
      })
    })
  })

  describe('makeArrayOfType', () => {
    it('Should return an array, whatever is passed', () => {
      type TestType = 'one' | 'two'
      const result1: Array<TestType> = ['one']
      expect(makeArrayOfType<TestType>('one') === result1)
      expect(makeArrayOfType<TestType>(['one']) === result1)
      expect(makeArrayOfType<TestType>(null) === undefined)
    })
  })

  describe('numberToOrdinal', () => {
    it('returns the ordinal for a number', () => {
      expect(numberToOrdinal(0)).toEqual('First')
      expect(numberToOrdinal(1)).toEqual('Second')
      expect(numberToOrdinal(2)).toEqual('Third')
      expect(numberToOrdinal(3)).toEqual('Fourth')
      expect(numberToOrdinal(4)).toEqual('Fifth')
    })

    it('returns undefined if the number is >5 or <0', () => {
      expect(numberToOrdinal(6)).toBeUndefined()
      expect(numberToOrdinal(-1)).toBeUndefined()
    })
  })

  describe('linebreaksToParagraphs', () => {
    it('returns a single paragraph', () => {
      expect(linebreaksToParagraphs('foo')).toEqual('<p class="govuk-body">foo</p>')
    })

    it('replaces single linebreaks with a line break element', () => {
      expect(linebreaksToParagraphs('foo\nbar')).toEqual('<p class="govuk-body">foo<br />bar</p>')
    })

    it('adds new paragraphs when there are two line breaks', () => {
      expect(linebreaksToParagraphs('foo\n\nbar')).toEqual('<p class="govuk-body">foo</p><p class="govuk-body">bar</p>')
    })

    it('handles Windows-style linebreaks', () => {
      expect(linebreaksToParagraphs('foo\r\nbar')).toEqual('<p class="govuk-body">foo<br />bar</p>')
      expect(linebreaksToParagraphs('foo\r\n\r\nbar')).toEqual(
        '<p class="govuk-body">foo</p><p class="govuk-body">bar</p>',
      )
    })
  })

  describe('pluralize', () => {
    it.each([
      ['dog', 2, undefined, '2 dogs'],
      ['dog', 1, undefined, '1 dog'],
      ['dog', -2, undefined, '-2 dogs'],
      ['dog', -1, undefined, '-1 dog'],
      ['dog', 0, undefined, '0 dogs'],
      ['person', 0, 'people', '0 people'],
      ['person', 1, 'people', '1 person'],
    ])('pluralises %s to %s when count is %s', (noun: string, count: number, plural: string, expected: string) => {
      expect(pluralize(noun, count, plural)).toEqual(expected)
    })
  })

  describe('joinWithCommas', () => {
    it.each([
      [['one'], 'one'],
      [['one', 'two'], 'one and two'],
      [['one', 'two', 'three', 'four'], 'one, two, three and four'],
      [[], ''],
    ])('joins %s giving %s', (list: Array<string>, expected: string) => {
      expect(joinWithCommas(list)).toEqual(expected)
    })
  })

  describe('isCardinal', () => {
    it.each([
      ['1', true],
      [' 2 ', true],
      ['0', true],
      ['1234567890', true],
      ['-1', false],
      ['1.1', false],
      ['', false],
      [' ', false],
      ['1a', false],
    ])('tests "%s" giving %s', (str, expected) => {
      expect(isCardinal(str)).toBe(expected)
    })
  })

  describe('objectClean', () => {
    it('removes undefined values from object', () => {
      const object = { zero: 0, one: 1, two: undefined, three: 'three' } as Record<string, string | number>
      expect(objectClean(object)).toEqual({ zero: 0, one: 1, three: 'three' })
    })
  })

  describe('settlePromises', () => {
    const fn = async (val: string) => {
      if (val === 'error') throw new Error(val)
      return val
    }
    const promises = [fn('one'), fn('error'), fn('two')] as Array<Promise<never>>

    it('should wait for all promises to resolve or reject, and return results', async () => {
      const result = await settlePromises(promises)
      expect(result).toEqual(['one', undefined, 'two'])
    })

    it('should return a default value if provided', async () => {
      const result = await settlePromises(promises, ['', 'error default', ''])
      expect(result).toEqual(['one', 'error default', 'two'])
    })
  })

  describe('settlePromisesWithOutcomes', () => {
    const fn = async (val: string) => {
      if (val === 'error') throw new Error()
      if (val === 'notfound') throw new ErrorWithData({ status: 404 })
      return val
    }
    const promises = [fn('one'), fn('error'), fn('notfound')] as Array<Promise<never>>

    it('should wait for all promises to resolve or reject, and return responses and outcomes', async () => {
      const result = await settlePromisesWithOutcomes(promises)
      expect(result).toEqual({ values: ['one', undefined, undefined], outcomes: ['success', 'failure', 'notFound'] })
    })
  })
})
