function backToTop(jumpLink) {
  // browser doesn't support InteractionObserver, just use default behaviour
  if (!('IntersectionObserver' in window)) {
    return
  }

  jumpLink.classList.add('back-to-top--hidden', 'back-to-top--fixed')

  // show jump link as fixed when side navigation is no longer visible
  // change jump link to relative when footer is visible
  const navObserver = new IntersectionObserver(([entry]) => {
    jumpLink.classList.toggle('back-to-top--hidden', entry.isIntersecting)
  })
  const footerObserver = new IntersectionObserver(([entry]) => {
    jumpLink.classList.toggle('back-to-top--fixed', !entry.isIntersecting)
  })

  const sideNav = document.querySelector('nav.moj-side-navigation')
  if (sideNav) {
    navObserver.observe(sideNav)
  }

  const footer = document.querySelector('footer')
  if (footer) {
    footerObserver.observe(footer)
  }
}

export default backToTop
