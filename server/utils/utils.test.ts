import { path } from 'static-path'
import type { SummaryListItem } from '@approved-premises/ui'
import { PersonRisks } from '@approved-premises/api'
import {
  camelCase,
  convertToTitleCase,
  initialiseName,
  linkTo,
  mapApiPersonRisksForUi,
  pascalCase,
  removeBlankSummaryListItems,
  resolvePath,
} from './utils'
import { risksFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
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
    [null, null, null],
    ['Empty string', '', null],
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
          text: 'NOMS Number',
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
          text: 'NOMS Number',
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
        level: 'CAT 2 / LEVEL 1',
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
    risks.roshRisks = null

    const actual = mapApiPersonRisksForUi(risks)

    expect(actual).toEqual({
      crn: risks.crn,
      flags: risks.flags.value,
      mappa: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
        level: 'CAT 2 / LEVEL 1',
      },
      roshRisks: {
        lastUpdated: '',
      },
      tier: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated),
        level: risks.tier.value.level,
      },
    })
  })

  it('handles the case where mappa is null', () => {
    risks.mappa = null

    const actual = mapApiPersonRisksForUi(risks)

    expect(actual).toEqual({
      crn: risks.crn,
      flags: risks.flags.value,
      mappa: {
        lastUpdated: '',
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

  it('handles the case where tier is null', () => {
    risks.tier = null

    const actual = mapApiPersonRisksForUi(risks)

    expect(actual).toEqual({
      crn: risks.crn,
      flags: risks.flags.value,
      mappa: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
        level: 'CAT 2 / LEVEL 1',
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
        lastUpdated: '',
      },
    })
  })

  it('handles the case where flags is null', () => {
    risks.flags.value = null

    const actual = mapApiPersonRisksForUi(risks)

    expect(actual).toEqual({
      crn: risks.crn,
      flags: null,
      mappa: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
        level: 'CAT 2 / LEVEL 1',
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
})

describe('linkTo', () => {
  it('returns a generic link', () => {
    expect(linkTo(path('/foo'), {}, { text: 'Hello' })).toMatchStringIgnoringWhitespace('<a href="/foo">Hello</a>')
  })

  it('allows params to be specified', () => {
    expect(linkTo(path('/foo/:id'), { id: '123' }, { text: 'Hello' })).toMatchStringIgnoringWhitespace(
      '<a href="/foo/123">Hello</a>',
    )
  })

  it('allows hidden text to be specified', () => {
    expect(
      linkTo(path('/foo/:id'), { id: '123' }, { text: 'Hello', hiddenText: 'Hidden' }),
    ).toMatchStringIgnoringWhitespace('<a href="/foo/123">Hello <span class="govuk-visually-hidden">Hidden</span></a>')
  })

  it('allows attributes to be specified', () => {
    expect(
      linkTo(path('/foo/:id'), { id: '123' }, { text: 'Hello', attributes: { class: 'some-class' } }),
    ).toMatchStringIgnoringWhitespace('<a href="/foo/123" class="some-class">Hello</a>')
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
})
