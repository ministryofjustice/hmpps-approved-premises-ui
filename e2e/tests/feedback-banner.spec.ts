import { expect } from '@playwright/test'
import { test } from '../test'
import { signIn } from '../steps/signIn'

test('feedback banner', async ({ page, userWithoutRoles }) => {
  await signIn(page, userWithoutRoles)

  await page.goto('/')
  const link = page.getByRole('link', { name: 'report a bug' })

  await expect(link).toHaveAttribute(
    'href',
    'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=1ba4a5691b9f9a10a1e2ddf0b24bcbb1&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=1ba4a5691b9f9a10a1e2ddf0b24bcbb1',
  )
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', 'noreferrer noopener')

  const feedbackLink = page.getByRole('link', { name: 'Give us your feedback' })

  await expect(feedbackLink).toHaveAttribute('href', 'https://forms.office.com/e/jSiRQFF82r')
  await expect(feedbackLink).toHaveAttribute('target', '_blank')
  await expect(feedbackLink).toHaveAttribute('rel', 'noreferrer noopener')
})
