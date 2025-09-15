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
      to="/testing/hush/dont/touch/sink"
    >
      Content Box w/ title, content & link
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & click handler"
      @click="toast.show('click')"
    >
      Content Box w/ title, content & click handler
    </ContentBox>
    <ContentBox title="Content Box w/ Switch">
      <Switch> The Switch in question </Switch>
      <Switch>Another Impostor Switch!</Switch>
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ link"
      to="/testing/hush/dont/touch/sink"
      disabled
    >
      Disabled Content Box w/ link
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ click handler"
      @click="toast.show('you will never see this')"
      disabled
    >
      Disabled Content Box w/ click handler
    </ContentBox>
  </div>
  <Separator />
  <div class="content-box-container">
    <ContentBox
      title="Lonely Content Box"
      @click="toast.show('I am lonely :(')"
    >
      Lonely Content Box
    </ContentBox>
  </div>
  <Separator />
  <SkeletonContentBoxes :count="5" />
</template>

<script lang="ts" setup>
  // Vue Components
  import ContentBox from '@/components/ContentBox.vue';
  import Separator from '@/components/Separator.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  import cumulonimbusIcon from '@/assets/images/Cumulonimbus.svg';

  // Store Modules
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  // No External Modules to import here.

  const toast = toastStore();
</script>
