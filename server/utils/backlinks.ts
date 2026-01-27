import { match, Path } from 'path-to-regexp'
import { RequestWithSession } from '@approved-premises/ui'

/**
 * Provides referer links for pages with multiple routes
 * A set of match path patterns are provided. If the referer in the request matches one of these paths,
 * the referer is returned and stored in the session against this page pattern.
 * If no match, the last stored referer for this page is returned
 * @param pagePattern a unique id for the page being rendered - typically the pattern of the path.
 * @param req the page request object
 * @param matchList an array of path.pattern strings to match against the referer in the request
 * @param defaultPath the path that is returned if there is no match in the session i.e. if the session has ended.
 * @return the url to use as the backlink for the page.
 */
export const getPageBackLink = (
  pagePattern: string,
  req: RequestWithSession,
  matchList: Array<Path>,
  defaultPath = '/',
): string => {
  const {
    session,
    headers: { referer },
  } = req

  const refererPath = (referer && new URL(referer).pathname) || ''
  const foundReferer = matchList.find(path => match(path)(refererPath))
  const lastReferer = session.pageReferers?.[pagePattern]
  if (foundReferer && lastReferer !== referer) {
    session.pageReferers = session.pageReferers || {}
    session.pageReferers[pagePattern] = referer
  }
  return foundReferer ? referer : lastReferer || defaultPath
}
