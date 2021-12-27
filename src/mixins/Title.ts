function getTitle(vm: any) {
  const { title } = vm.$options;
  if (title !== null && title !== undefined) {
    return typeof title === 'function' ? title.call(vm) : title;
  }
}

export default {
  created() {
    const title = getTitle(this);
    if (typeof title === 'string') {
      if (title !== '') document.title = 'Cumulonimbus | ' + title;
      else document.title = 'Cumulonimbus';
    }
  }
};
