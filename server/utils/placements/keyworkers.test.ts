import { userSummaryFactory } from '../../testutils/factories'
import { keyworkersTableHead, keyworkersTableRows } from './keyworkers'

describe('keyworkers utils', () => {
  describe('keyworkersTableRows', () => {
    const user1 = userSummaryFactory.build()
    const user2 = userSummaryFactory.build()
    const availableKeyworkers = [user1, user2]

    it('should match the number of header columns', () => {
      expect(keyworkersTableRows([user1])[0].length).toEqual(keyworkersTableHead.length)
    })

    it('returns rows of keyworkers for the Find a keyworker results', () => {
      expect(keyworkersTableRows(availableKeyworkers)).toEqual([
        [
          { text: user1.name },
          { text: user1.emailAddress },
          {
            html: `<button class="govuk-button govuk-button--secondary govuk-!-margin-0" type="submit" name="keyworker" value="${user1.id}">Assign keyworker</button>`,
          },
        ],
        [
          { text: user2.name },
          { text: user2.emailAddress },
          {
            html: `<button class="govuk-button govuk-button--secondary govuk-!-margin-0" type="submit" name="keyworker" value="${user2.id}">Assign keyworker</button>`,
          },
        ],
      ])
    })
  })
})
