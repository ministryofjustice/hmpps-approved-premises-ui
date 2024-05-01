import { Page } from '@playwright/test'
import { DashboardPage } from '../pages/apply'

export const visitDashboard = async (page: Page): Promise<DashboardPage> => {
  const dashboard = new DashboardPage(page)
  await dashboard.goto()

  return dashboard
}
