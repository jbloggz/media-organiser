<template>
  <div id="app">
    <div id="header">
      <div id="open-button" class="menu-button" title="Open Folder">
        <span class="fas fa-folder-open"></span>
      </div>
      <div
        v-if="selectedPhoto"
        id="save-button"
        class="menu-button"
        title="Save Photo"
      >
        <span class="fas fa-save"></span>
      </div>
      <div id="settings-button" class="menu-button" title="Settings">
        <span class="fas fa-sliders-h"></span>
      </div>
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
          :api-key="''"
          @loaded="loaded.map = true"
        />
      </div>
      <div id="summary" class="grid-item">
        <AttributeViewer :data="summary" @loaded="loaded.summary = true" />
      </div>
    </div>
    <BaseLoader v-if="showLoader" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import MapPicker from '@/components/MapPicker.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import TagPicker from '@/components/TagPicker.vue';
import AttributeViewer from '@/components/AttributeViewer.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

export default {
  name: 'App',
  components: {
    MapPicker,
    BaseLoader,
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
    }
  }
};
</script>

<style lang="scss">
:root {
  --background: #171819;
  --background-invert: #d8d9da;
  --text: #d8d9da;
  --text-invert: #303032;
  --component-background: #303032;
  --border: #404042;
  --hover: white;
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

input {
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

    .menu-button {
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

    #open-button {
      margin-left: 30px;
    }

    #settings-button {
      position: absolute;
      right: 30px;
    }
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
