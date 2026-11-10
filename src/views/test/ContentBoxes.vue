<template>
  <!--  CONTENT_BOXES  -->
  <div class="content-box-container">
    <ContentBox />
    <ContentBox title="Content Box w/ title" />
    <ContentBox>Content Box w/ content</ContentBox>
    <ContentBox title="Content Box w/ title & content">
      Content Box w/ title & content
    </ContentBox>
    <ContentBox title="Content Box w/ title & long content">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam aliquam
      error ducimus dicta officiis velit nulla ipsa minima repellendus expedita,
      atque unde iure aut veniam dolore necessitatibus corrupti, blanditiis
      repellat!
    </ContentBox>
    <ContentBox title="Content Box w/ title, nowrap & long content" nowrap>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam aliquam
      error ducimus dicta officiis velit nulla ipsa minima repellendus expedita,
      atque unde iure aut veniam dolore necessitatibus corrupti, blanditiis
      repellat!
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, p + code tags, nowrap & long content"
      nowrap
    >
      <p>Name: <code> Joe Mana </code></p>
      <p>Age: <code> 25 </code></p>
      <p>
        Email:
        <code>
          somereallylong@randomstuffthisprobablydoesntexist.hopefully.biz
        </code>
      </p>
      <p>
        More long content:
        <code>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam
          aliquam error ducimus dicta officiis velit nulla ipsa minima
          repellendus expedita, atque unde iure aut veniam dolore necessitatibus
          corrupti, blanditiis repellat!
        </code>
      </p>
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & local icon"
      :src="cumulonimbusIcon"
    >
      Content Box w/ title, content & local icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & theme safe local icon"
      :src="cumulonimbusIcon"
      theme-safe
    >
      Content Box w/ title, content & theme safe local icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & external icon"
      src="https://alekeagle.com/alerkpog.png"
    >
      Content Box w/ title, content & external icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & theme safe external icon"
      src="https://alekeagle.com/alerkpog.png"
      theme-safe
    >
      Content Box w/ title, content & theme safe external icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & link"
      to="/ui-sandbox/sink"
    >
      Content Box w/ title, content & link
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & click handler"
      @click="showToast('click')"
    >
      Content Box w/ title, content & click handler
    </ContentBox>
    <ContentBox title="Content Box w/ Switch">
      <Switch> The Switch in question </Switch>
      <Switch>Another Impostor Switch!</Switch>
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ link"
      to="/ui-sandbox/sink"
      disabled
    >
      Disabled Content Box w/ link
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ click handler"
      @click="showToast('you will never see this')"
      disabled
    >
      Disabled Content Box w/ click handler
    </ContentBox>
  </div>
  <Separator />
  <div class="content-box-container">
    <ContentBox title="Lonely Content Box" @click="showToast('I am lonely :(')">
      Lonely Content Box
    </ContentBox>
  </div>
  <Separator />
  <SkeletonContentBoxes :count="5" />
</template>

<script lang="ts" setup>
  // Vue Components
  import ContentBox from '&/ContentBox.vue';
  import Separator from '&/Separator.vue';
  import SkeletonContentBoxes from '&/SkeletonContentBoxes.vue';
  import Switch from '&/Switch.vue';

  // In-House Modules
  import cumulonimbusIcon from '!/images/Cumulonimbus.svg';

  // Store Modules
  import { toastStore } from '$/toast.js';

  // External Modules
  // No External Modules to import here.

  const toast = toastStore();

  function showToast(message: string) {
    toast.show(message);
  }
</script>
