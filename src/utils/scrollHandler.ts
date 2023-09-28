function scrollHandler(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function disableScrolling() {
  document.body.addEventListener("scroll", scrollHandler, {passive: false});
  document.body.addEventListener("wheel", scrollHandler, {passive: false});
  document.body.addEventListener("touchmove", scrollHandler, {passive: false});
}

export function enableScrolling() {
  document.body.removeEventListener("scroll", scrollHandler, {passive: false});
  document.body.removeEventListener("wheel", scrollHandler, {passive: false});
  document.body.removeEventListener("touchmove", scrollHandler, {passive: false});
}