function scrollHandler(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function disableScrolling() {
  document.body.addEventListener("scroll", scrollHandler, false);
  document.body.addEventListener("wheel", scrollHandler, false);
  document.body.addEventListener("touchmove", scrollHandler, false);
}

export function enableScrolling() {
  document.body.removeEventListener("scroll", scrollHandler, false);
  document.body.removeEventListener("wheel", scrollHandler, false);
  document.body.removeEventListener("touchmove", scrollHandler, false);
}