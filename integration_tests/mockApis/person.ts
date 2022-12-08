import { SuperAgentRequest } from 'superagent'

import type { Person, PersonRisks, PrisonCaseNote, Adjudication, ActiveOffence } from '@approved-premises/api'

import { stubFor, getMatchingRequests } from '../../wiremock'

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
  verifyFindPerson: async (args: { person: Person }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      })
    ).body.requests,

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
}
