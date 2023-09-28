function scrollHandler(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function disableScrolling() {
  document.body.addEventListener("scroll", scrollHandler);
  document.body.addEventListener("wheel", scrollHandler);
  document.body.addEventListener("touchmove", scrollHandler);
}

export function enableScrolling() {
  document.body.removeEventListener("scroll", scrollHandler);
  document.body.removeEventListener("wheel", scrollHandler);
  document.body.removeEventListener("touchmove", scrollHandler);
}