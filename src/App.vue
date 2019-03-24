<template>
  <div id="app">
    <BaseLoader :show="showLoader" background="#000000" />
    <div id="header">
      <OpenButton />
      <SaveButton />
      <SettingsButton @themeChanged="setTheme" />
    </div>
    <div id="container">
      <div id="head-spacer"></div>
      <div id="photos" class="grid-item">
        <PhotoViewer @loaded="loaded.photo = true" />
      </div>
      <div id="tags" class="grid-item">
        <TagPicker :tag-type="'people'" @loaded="loaded.tags = true" />
      </div>
      <div id="people" class="grid-item">
        <TagPicker :tag-type="'tags'" @loaded="loaded.people = true" />
      </div>
      <div id="map" class="grid-item">
        <MapPicker
          :location="location"
          :api-key="apiKey"
          @loaded="loaded.map = true"
        />
      </div>
      <div id="summary" class="grid-item">
        <AttributeViewer :data="summary" @loaded="loaded.summary = true" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import MapPicker from '@/components/MapPicker.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import OpenButton from '@/components/OpenButton.vue';
import SaveButton from '@/components/SaveButton.vue';
import SettingsButton from '@/components/SettingsButton.vue';
import TagPicker from '@/components/TagPicker.vue';
import AttributeViewer from '@/components/AttributeViewer.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

export default {
  name: 'App',
  components: {
    MapPicker,
    BaseLoader,
    SettingsButton,
    OpenButton,
    SaveButton,
    TagPicker,
    AttributeViewer,
    PhotoViewer
  },
  data() {
    return {
      loaded: {
        photo: false,
        tags: false,
        people: false,
        map: false,
        summary: false
      }
    };
  },
  computed: {
    ...mapGetters(['location', 'summary', 'tags', 'selectedPhoto']),
    showLoader() {
      return !(
        this.loaded.photo &&
        this.loaded.tags &&
        this.loaded.people &&
        this.loaded.map &&
        this.loaded.summary
      );
    },
    apiKey() {
      return localStorage.apiKey;
    }
  },
  mounted() {
    if (localStorage.theme) {
      this.setTheme(localStorage.theme);
    }
  },
  methods: {
    setTheme(theme) {
      let root = window.document.documentElement;
      root.style.setProperty('--background', `var(--${theme}-background`);
      root.style.setProperty(
        '--background-invert',
        `var(--${theme}-background-invert`
      );
      root.style.setProperty('--text', `var(--${theme}-text`);
      root.style.setProperty('--text-invert', `var(--${theme}-text-invert`);
      root.style.setProperty(
        '--component-background',
        `var(--${theme}-component-background`
      );
      root.style.setProperty('--border', `var(--${theme}-border`);
      root.style.setProperty('--hover', `var(--${theme}-hover`);
    }
  }
};
</script>

<style lang="scss">
:root {
  /* Dark theme */
  --dark-background: #171819;
  --dark-background-invert: #d8d9da;
  --dark-text: #d8d9da;
  --dark-text-invert: #303032;
  --dark-component-background: #303032;
  --dark-border: #404042;
  --dark-hover: white;

  /* Dark theme */
  --light-background: #d8d9da;
  --light-background-invert: #171819;
  --light-text: #303032;
  --light-text-invert: #d8d9da;
  --light-component-background: #d0d0d2;
  --light-border: #a0a0a2;
  --light-hover: white;

  /* Default to dark */
  --background: var(--dark-background);
  --background-invert: var(--dark-background-invert);
  --text: var(--dark-text);
  --text-invert: var(--dark-text-invert);
  --component-background: var(--dark-component-background);
  --border: var(--dark-border);
  --hover: var(--dark-hover);
}

/* Apply a natural box layout model to all elements, but allowing components to change */
html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  color: var(--text);
  background-color: var(--background);
}

input.txt-input {
  background: var(--background);
  color: var(--text);
  border: 1px solid var(--border);

  &:focus {
    outline: none;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 5px rgba(102, 175, 233, 0.6);
  }
}

#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 18px;
  line-height: 1.5;
}

#header .menu-button {
  display: inline-block;
  font-size: 20px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;

  &:hover {
    background: var(--border);
    cursor: pointer;
  }
}
</style>

<style lang="scss" scoped>
#app {
  #header {
    height: 43px;
    width: 100%;
    min-width: 500px;
    position: fixed;
    z-index: 100;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: var(--component-background);
    border: solid 3px var(--border);
    border-top: none;
  }

  div#container {
    display: grid;
    grid-template-columns: auto 500px 5px 500px auto;
    grid-template-areas:
      'head-spacer head-spacer head-spacer head-spacer head-spacer'
      '.           photos      .           tags                  .'
      '.           photos      .           people                .'
      '.           map         .           summary               .';

    #head-spacer {
      grid-area: head-spacer;
      height: 43px;
    }
    #photos {
      grid-area: photos;
      width: 500px;
    }
    #tags {
      grid-area: tags;
      width: 500px;
      min-height: 225px;
      padding: 10px;
    }
    #people {
      grid-area: people;
      width: 500px;
      min-height: 225px;
      padding: 10px;
    }
    #map {
      grid-area: map;
      width: 500px;
    }
    #summary {
      grid-area: summary;
      width: 500px;
      min-height: 350px;
      padding: 10px;
    }
    .grid-item {
      margin-top: 5px;
      background: var(--component-background);
      border: solid 3px var(--border);
      border-radius: 5px;
    }
  }

  @media screen and (max-width: 1000px) {
    div#container {
      grid-template-columns: auto 500px auto;
      grid-template-areas:
        'head-spacer head-spacer head-spacer'
        '.           photos                .'
        '.           tags                  .'
        '.           people                .'
        '.           map                   .'
        '.           summary               .';
    }
  }
}
</style>
