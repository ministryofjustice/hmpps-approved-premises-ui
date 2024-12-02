import { path } from 'static-path'
import type { SummaryListItem } from '@approved-premises/ui'
import { PersonRisks } from '@approved-premises/api'
import {
  camelCase,
  convertToTitleCase,
  initialiseName,
  linebreaksToParagraphs,
  linkTo,
  mapApiPersonRisksForUi,
  numberToOrdinal,
  objectIfNotEmpty,
  pascalCase,
  pluralize,
  removeBlankSummaryListItems,
  resolvePath,
} from './utils'
import { risksFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'

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
    ).toMatchStringIgnoringWhitespace('<a href="/foo/123">Hello <span class="govuk-visually-hidden">Hidden</span></a>')
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
    ['dog', 'dogs', 2],
    ['dog', 'dog', 1],
    ['dog', 'dogs', -2],
  ])('pluralises %s to %s when count is %s', (noun: string, expected: string, count: number) => {
    expect(pluralize(noun, count)).toEqual(`${count} ${expected}`)
  })
})
