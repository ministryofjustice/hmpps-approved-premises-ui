/* eslint-disable no-console */
import { isAfter, parseISO, subMinutes } from 'date-fns'
import { expect } from '@playwright/test'
import { NotifyClient } from 'notifications-node-client'
import { TestOptions } from '@approved-premises/e2e'

export const verifyEmailSent = async (
  emailAddress: TestOptions['user']['email'],
  subject: string,
  bodyIncludes?: string | undefined,
) => {
  if (emailAddress && process.env.CAS1_E2E_CHECK_EMAILS === 'true') {
    await expect(async () => {
      const client = new NotifyClient(process.env.NOTIFY_API_KEY)
      const response = await client.getNotifications('email')
      const { notifications } = response.data
      const notificationsForEmail = notifications.filter(
        notification => notificationWasSentInTheLastMinute(notification) && notification.email_address === emailAddress,
      )

      if (notificationsForEmail.length === 0) {
        const summary = notifications.map(n => n.email_address)

        console.error(
          `No email messages with subject '${subject}' found for the given email address '${emailAddress}'. Have received ${notifications.length} emails sent to '${summary}'`,
        )
        return false
      }

      const notificationsWithSubject = notificationsForEmail.filter(notification => notification.subject === subject)

      if (notificationsWithSubject.length === 0) {
        console.error(
          `
          No email messages found with the subject '${subject}' - subject lines found:
          ${notificationsForEmail.map(n => n.subject).join('\r\n')}
        `,
        )
        return false
      }

      const notificationsWithBody = notificationsWithSubject.filter(notification =>
        bodyIncludes ? notification.body.includes(bodyIncludes) : true,
      )

      if (notificationsWithBody.length === 0) {
        console.error(
          `
          No email messages found with the subject '${subject}' and body '${bodyIncludes}' - email bodies for subject are:
          ${notificationsWithSubject.map(n => n.body).join('\r\n')}
        `,
        )
        return false
      }

      return true
    }).toPass()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notificationWasSentInTheLastMinute = (notification: any) =>
  isAfter(parseISO(notification.sent_at), subMinutes(Date.now(), 1))
