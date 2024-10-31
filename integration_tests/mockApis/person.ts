import { readFileSync } from 'fs'
import path from 'path'
import { SuperAgentRequest } from 'superagent'

import type {
  ActiveOffence,
  Adjudication,
  Document,
  OASysSection,
  OASysSections,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PersonalTimeline,
  PrisonCaseNote,
} from '@approved-premises/api'

import { stubFor } from './setup'
import paths from '../../server/paths/api'
import { createQueryString } from '../../server/utils/utils'

export default {
  stubFindPerson: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.person,
      },
    }),
  stubFindPersonAndCheckCaseload: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}&checkCaseload=true`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.person,
      },
    }),
  stubPersonNotFound: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      },
      response: {
        status: 404,
      },
    }),
  stubPersonRisks: (args: { person: Person; risks: PersonRisks }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/risks`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.risks,
      },
    }),
  stubPersonOffences: (args: { person: Person; offences: Array<ActiveOffence> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/offences`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offences,
      },
    }),
  stubPersonalTimeline: (args: { person: Person; timeline: PersonalTimeline }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.people.timeline({ crn: args.person.crn }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.timeline,
      },
    }),
  stubPrisonCaseNotes: (args: { person: Person; prisonCaseNotes: Array<PrisonCaseNote> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/prison-case-notes`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.prisonCaseNotes,
      },
    }),

  stubPrisonCaseNotes404: (args: { person: Person }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/prison-case-notes`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 404 },
      },
    }),

  stubAdjudications: (args: { person: Person; adjudications: Array<Adjudication> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/adjudications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.adjudications,
      },
    }),

  stubAcctAlerts: (args: { person: Person; acctAlerts: Array<PersonAcctAlert> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.people.acctAlerts({ crn: args.person.crn }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.acctAlerts,
      },
    }),

  stubOasysSelection404: (args: { person: Person }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/selection`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 404 },
      },
    }),

  stubOasysSelection: (args: { person: Person; oasysSelection: Array<OASysSection> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/selection`,
      },

      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSelection,
      },
    }),

  stubOasysSection404: (args: { person: Person }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/people/${args.person.crn}/oasys/sections`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 404 },
      },
    }),

  stubOasysSections: (args: { person: Person; oasysSections: OASysSections }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/sections`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSections,
      },
    }),

  stubOasysSectionsWithSelectedSections: (args: {
    person: Person
    oasysSections: OASysSections
    selectedSections: Array<number>
  }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/sections?${createQueryString({
          'selected-sections': args.selectedSections,
        })}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSections,
      },
    }),

  stubPersonDocument: (args: { person: Person; document: Document }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/documents/${args.person.crn}/${args.document.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${args.document.fileName}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', 'fixtures', 'document.pdf'), {
          encoding: 'base64',
        }),
      },
    }),
}
