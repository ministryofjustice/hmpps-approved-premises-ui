import { ApprovedPremisesApplicationStatus } from '@approved-premises/api'
import { HtmlItem, IdentityBarMenuItem, TableCell } from '@approved-premises/ui'
import {
  actionsCell,
  getActions,
  getApplicationTableHeader,
  getApplicationTableRows,
  nameCell,
} from './manageApplications'
import { cas1ApplicationSummaryFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { ApplicationStatusTag } from './statusTag'
import paths from '../../paths/apply'
import { createQueryString } from '../utils'
import placementApplicationPaths from '../../paths/placementApplications'
import * as tableUtils from '../tableUtils'

describe('manageApplications', () => {
  describe('nameCell', () => {
    const id = 'some-id'
    const person = fullPersonFactory.build()
    const mockCell: TableCell = { html: 'output' }

    beforeEach(() => {
      jest.spyOn(tableUtils, 'nameCellLink').mockReturnValue(mockCell)
    })

    it('renders the name cell without link', () => {
      expect(nameCell({ id, person, status: 'started' })).toEqual(mockCell)
      expect(tableUtils.nameCellLink).toHaveBeenCalledWith(person, undefined)
    })

    it('renders the name cell with link', () => {
      expect(nameCell({ id, person, status: 'placementAllocated' })).toEqual(mockCell)
      expect(tableUtils.nameCellLink).toHaveBeenCalledWith(person, `/applications/${id}`)
    })
  })

  describe('getApplicationTableHeader', () => {
    it('should return the table header', () => {
      expect(getApplicationTableHeader()).toEqual([
        { text: 'Name' },
        { attributes: { 'aria-sort': 'none' }, text: 'Tier' },
        { attributes: { 'aria-sort': 'ascending' }, text: 'Created on' },
        { text: 'Created by' },
        { attributes: { 'aria-sort': 'none' }, text: 'Requested arrival date' },
        { attributes: { 'aria-sort': 'none' }, text: 'Application status' },
        { text: 'Actions' },
      ])
    })
  })

  describe('getApplicationTableRows', () => {
    it('should return the table rows', () => {
      const person = fullPersonFactory.build()
      const application = cas1ApplicationSummaryFactory.build({
        person,
        tier: 'A3',
        createdAt: '2024-12-16T15:35',
        arrivalDate: '2025-02-03T09:15',
      })

      const row = getApplicationTableRows([application], '')[0]
      expect(row[0]).toEqual(nameCell(application))
      expect(row[1]).toEqual({
        attributes: { 'data-sort-value': 'A6' },
        html: `<span class="moj-badge moj-badge--red">A3</span>`,
      })
      expect(row[2]).toEqual({ attributes: { 'data-sort-value': '2024-12-16T15:35' }, text: '16 Dec 2024' })
      expect(row[3]).toEqual({ text: application.createdByUserName })
      expect(row[4]).toEqual({ attributes: { 'data-sort-value': '2025-02-03T09:15' }, text: '3 Feb 2025' })
      expect(row[5]).toEqual({ html: new ApplicationStatusTag(application.status).html() })
      expect(row[6]).toEqual(actionsCell(getActions(application, '')))
    })
  })

  describe('ActionsCell', () => {
    it('renders the list of actions', () => {
      const action: IdentityBarMenuItem = { href: 'link', text: 'Action label' }
      const { html } = actionsCell([action]) as HtmlItem
      expect(html).toMatchStringIgnoringWhitespace(
        `<ul class="govuk-list govuk-list--spaced"><li><a href="link">Action label</a></li></ul>`,
      )
    })
  })

  describe('getActions', () => {
    const thisUserId = 'this-user-id'
    const otherUserId = 'other-user-id'
    const id = 'applicationId'
    const baseApplication = cas1ApplicationSummaryFactory.build({
      createdByUserId: thisUserId,
      id,
      hasRequestsForPlacement: false,
    })

    const continueLink = { text: 'Continue application', href: paths.applications.show({ id }) }
    const withdrawLink = { text: 'Withdraw application', href: paths.applications.withdraw.new({ id }) }
    const expireLink = { text: 'Expire application', href: paths.applications.expire({ id }) }
    const placementRequestLink = {
      text: 'Create placement request',
      href: placementApplicationPaths.placementApplications.create({}) + createQueryString({ id }),
    }

    it(`when unsubmitted, it should return withdraw and continue links if user's own application or expire if not`, () => {
      const application = { ...baseApplication, status: 'started' as ApprovedPremisesApplicationStatus }

      expect(getActions(application, thisUserId)).toEqual([continueLink, withdrawLink])
      expect(getActions(application, otherUserId)).toEqual([expireLink])
    })

    it(`when awaiting assessment, it should return a withdraw link is user's application, or expire if not`, () => {
      const application = { ...baseApplication, status: 'awaitingAssesment' as ApprovedPremisesApplicationStatus }

      expect(getActions(application, thisUserId)).toEqual([withdrawLink])
      expect(getActions(application, otherUserId)).toEqual([expireLink])
    })

    it(`when suitable, but without placement requests it should return placement request link and a withdraw link if user's application, or expire if not`, () => {
      const application = { ...baseApplication, status: 'pendingPlacementRequest' as ApprovedPremisesApplicationStatus }

      expect(getActions(application, thisUserId)).toEqual([placementRequestLink, withdrawLink])
      expect(getActions(application, otherUserId)).toEqual([placementRequestLink, expireLink])
    })

    it(`when suitable, and with placement requests it should return placement request and expire links`, () => {
      const application = {
        ...baseApplication,
        status: 'placementAllocated' as ApprovedPremisesApplicationStatus,
        hasRequestsForPlacement: true,
      }

      expect(getActions(application, thisUserId)).toEqual([placementRequestLink, expireLink])
      expect(getActions(application, otherUserId)).toEqual([placementRequestLink, expireLink])
    })
  })
})
