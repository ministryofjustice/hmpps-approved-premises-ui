import { readFileSync } from 'fs'
import path from 'path'
import { SuperAgentRequest } from 'superagent'

import type {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Cas1OASysSupportingInformationQuestionMetaData,
  Cas1PersonalTimeline,
  Cas1SpaceBooking,
  Document,
  Person,
  PersonAcctAlert,
  PersonRisks,
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
  stubPersonalTimeline: (args: { person: Person; timeline: Cas1PersonalTimeline }): SuperAgentRequest =>
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

  stubOasysMetadata: (args: {
    person: Person
    oasysMetadata: { supportingInformation: Array<Cas1OASysSupportingInformationQuestionMetaData> }
  }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.people.oasys.metadata({ crn: args.person.crn }),
      },

      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysMetadata,
      },
    }),

  stubOasysMetadata404: (args: { person: Person }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.people.oasys.metadata({ crn: args.person.crn }),
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 404 },
      },
    }),

  stubOasysGroup: (args: { person: Person; group: Cas1OASysGroup; includeOptionalSections: Array<number> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.people.oasys.answers({ crn: args.person.crn })}?${createQueryString({ group: args.group.group, includeOptionalSections: args.includeOptionalSections })}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.group,
      },
    }),

  stubOasysGroup404: (args: { person: Person }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: paths.people.oasys.answers({ crn: args.person.crn }),
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 404 },
      },
    }),

  stubSpaceBookings: (args: { person: Person; bookings: Array<Cas1SpaceBooking>; includeCancelled?: boolean }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.people.spaceBookings({ crn: args.person.crn })}/?${createQueryString({
          includeCancelled: args.includeCancelled ?? false,
        })}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.bookings,
      },
    }),

  stubPersonDocument: (args: { person: Person; document: Document }) =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.people.documents({ crn: args.person.crn, documentId: args.document.id }),
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
