<template>
  <h1>Upload</h1>
  <h2>Do the upload things.</h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.replace('/dashboard/')" title="Go back!"
      >Back</button
    >
  </div>
  <div class="upload-box-container">
    <div class="upload-box">
      <form ref="fileForm" @submit.prevent="uploadFile">
        <input
          type="file"
          name="file"
          @change.prevent="fileAdded"
          id="file"
          class="upload-file"
        />
        <label
          v-text="file && state === 'default' ? file.name : text[state]"
          @dragover.prevent.stop="state = 'dragover'"
          @dragleave.prevent.stop="state = 'default'"
          @drop.prevent.stop="drop"
          for="file"
        ></label>
        <button class="button" :disabled="!file">To Mars it goes!</button>
      </form>
      <button @click="() => copyToClipboard(false)" v-if="link"
        >Copy link</button
      >
    </div>
  </div>
  <transition name="upload-animation-container">
    <div v-if="upload" class="upload-animation-container"><Loading /></div>
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import App from '@/App.vue';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import Loading from '@/components/Loading.vue';

  const labelText = {
    dragover: 'Drop it right here!',
    manyFiles: "That's too many files for me!",
    default: 'Your file here.'
  };

  function parseQueryString(qs: string, sep?: string, eq?: string) {
    let parsed: { [key: string]: string | boolean } = {};
    if (!qs) return parsed;
    qs.split(sep || '&').forEach(p => {
      let ps = p.split(eq || '=');
      parsed[unescape(ps[0])] = ps[1] ? unescape(ps[1]) : true;
    });
    return parsed;
  }

  function getOS() {
    let userAgent = window.navigator.userAgent,
      platform =
        (navigator as any).userAgentData.platform || window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }

    return os;
  }

  function getPWADisplayMode() {
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    if (document.referrer.startsWith('android-app://')) {
      return 'twa';
    } else if ((navigator as any).standalone || isStandalone) {
      return 'standalone';
    }
    return 'browser';
  }

  @Options({
    components: { Loading },
    data() {
      return {
        state: 'default',
        link: undefined,
        upload: false,
        file: undefined,
        text: labelText
      };
    },
    title: 'Upload'
  })
  export default class Upload extends Vue {
    declare $data: {
      state: string;
      link?: string;
      upload: boolean;
      file?: File;
      text: { [key: string]: string };
    };
    declare $refs: {
      fileForm: HTMLFormElement;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          10000
        );
        return;
      }
      if (
        getOS() === 'Android' &&
        !parseQueryString(window.location.href.split('?')[1]).file
      ) {
        if (
          getPWADisplayMode() === 'twa' ||
          getPWADisplayMode() === 'standalone'
        ) {
          (this.$parent?.$parent as App).temporaryToast(
            'Pro Tip: You can use the native share menu from any app to share content to Cumulonimbus!',
            15000
          );
        } else if (getPWADisplayMode() === 'browser') {
          (this.$parent?.$parent as App).temporaryToast(
            'Pro Tip: If you install Cumulonimbus as an app, you can use the native share menu from any app to share content to Cumulonimbus!',
            15000
          );
        }
      }
      if (parseQueryString(window.location.href.split('?')[1]).file) {
        try {
          let file = await fetch(
            `/shared-files/${
              parseQueryString(window.location.href.split('?')[1]).file
            }`
          );
          if (file.ok) {
            let slime = await file.blob();
            this.$data.file = new File(
              [slime],
              file.headers.get('X-Filename') as string
            );
            this.uploadFile();
          }
        } catch (error) {
          this.$router.push(window.location.pathname);
        }
      }
    }
    drop(e: DragEvent) {
      if ((e.dataTransfer as DataTransfer).files.length > 1) {
        this.$data.state = 'manyFiles';
        setTimeout(() => {
          this.$data.state = 'default';
        }, 5000);
        return;
      }
      this.$data.state = 'default';
      this.$data.file = (e.dataTransfer as DataTransfer).files[0];
    }
    fileAdded(e: InputEvent) {
      if (((e.target as HTMLInputElement).files as FileList).length > 1) {
        this.$data.state = 'manyFiles';
        setTimeout(() => {
          this.$data.state = 'default';
        }, 5000);
        return;
      }
      this.$data.state = 'default';
      this.$data.file = ((e.target as HTMLInputElement).files as FileList)[0];
    }
    async uploadFile() {
      this.$data.link = undefined;
      this.$data.upload = true;
      try {
        let success = await (this.$store.state.client as Client).uploadData(
          this.$data.file
        );
        this.$data.upload = false;
        this.$data.file = undefined;
        this.$data.link = success.url;
        this.$refs.fileForm.reset();
        this.copyToClipboard(true);
        if (parseQueryString(window.location.href.split('?')[1]).file) {
          navigator.serviceWorker.controller?.postMessage({
            op: 0,
            d: parseQueryString(window.location.href.split('?')[1]).file
          });
          this.$router.push(window.location.pathname);
        }
      } catch (error) {
        this.$data.upload = false;
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "That's funny, your session just expired!",
                15000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                10000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'BODY_TOO_LARGE_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'Your file is too big! Sorry!',
                15000
              );
              this.$data.file = undefined;
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                15000
              );
              console.log(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            10000
          );
          console.error(error);
        }
      }
    }
    copyToClipboard(fromUpload: boolean) {
      navigator.clipboard.writeText(this.$data.link as string).then(
        () => {
          (this.$parent?.$parent as App).temporaryToast(
            fromUpload
              ? 'Upload successful, link was automatically copied to your clipboard!'
              : 'Copied to your clipboard!'
          );
        },
        err => {
          (this.$parent?.$parent as App).temporaryToast(
            fromUpload
              ? "Upload successful, I wasn't able to copy the link to your clipboard though. Click that button to copy it!"
              : "I still wasn't able to do it, it might be a browser permission issue. Let us know about it in the discord please!",
            20000
          );
          console.error(err);
        }
      );
    }
  }
</script>

<style>
  .upload-box-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 100px 0 25px 0;
  }

  .upload-box {
    height: auto;
    border-radius: 50px;
    width: 40vw;
    border: 2px solid #cccccc;
    box-shadow: 0px 0px 75px 20px #ccccccaa;
    transition: background-color 0.25s, border 0.25s, box-shadow 0.25s,
      height 0.25s;
    padding: 0 25px 45px 25px;
    min-width: fit-content;
  }

  .upload-box h2 {
    margin-top: 45px;
  }

  html.dark-theme .upload-box {
    border: 2px solid #000000;
    box-shadow: 0px 0px 75px 20px #000000aa;
  }

  .upload-file {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .upload-file + label {
    font-size: 25px;
    font-weight: 700;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    color: #000;
    background-color: #fff;
    display: block;
    cursor: pointer;
    overflow-x: hidden;
    overflow-wrap: break-word;
    max-width: inherit;
    margin-top: 45px;
    margin-bottom: 10px;
    padding: 30px 20px;
    border-radius: 20px;
    border: 1px solid #000;
    transition: color 0.25s, background-color 0.25s, border 0.25s,
      box-shadow 0.25s;
    user-select: none;
  }

  .upload-file + label:hover {
    box-shadow: 0px 0px 8px 0px inset #000000, 0px 0px 8px 0px #000000;
  }

  html.dark-theme .upload-file + label {
    color: #fff;
    background-color: #212121;
  }

  html.dark-theme .upload-file + label:hover {
    border: 1px solid #dedede;
    box-shadow: 0px 0px 8px 0px inset #dedede, 0px 0px 8px 0px #dedede;
  }

  .upload-animation-container {
    z-index: 15;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    cursor: wait;
    background-color: #000000aa;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
  }

  .upload-animation-container-enter-active,
  .upload-animation-container-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .upload-animation-container-enter-from,
  .upload-animation-container-leave-to {
    opacity: 0;
    backdrop-filter: none;
  }

  .upload-animation-container-enter-to,
  .upload-animation-container-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
</style>
