function scrollHandler(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function disableScrolling() {
  document.body.addEventListener("scroll", scrollHandler, true);
  document.body.addEventListener("wheel", scrollHandler, true);
  document.body.addEventListener("touchmove", scrollHandler, true);
}

export function enableScrolling() {
  document.body.removeEventListener("scroll", scrollHandler, true);
  document.body.removeEventListener("wheel", scrollHandler, true);
  document.body.removeEventListener("touchmove", scrollHandler, true);
}