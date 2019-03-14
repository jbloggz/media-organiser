<template>
  <div id="app">
    <div id="header"></div>
    <div id="container">
      <div id="head-spacer"></div>
      <div id="photos" class="grid-item">
        <PhotoViewer />
      </div>
      <div id="tags" class="grid-item">
        <TagPicker :tag-list="tags('people')" :tag-type="'people'" />
      </div>
      <div id="people" class="grid-item">
        <TagPicker :tag-list="tags('tags')" :tag-type="'tags'" />
      </div>
      <div id="map" class="grid-item">
        <MapPicker :location="location" :api-key="''" />
      </div>
      <div id="summary" class="grid-item">
        <AttributeViewer :data="summary" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import MapPicker from '@/components/MapPicker.vue';
import TagPicker from '@/components/TagPicker.vue';
import AttributeViewer from '@/components/AttributeViewer.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

export default {
  name: 'App',
  components: { MapPicker, TagPicker, AttributeViewer, PhotoViewer },
  computed: {
    ...mapGetters(['location', 'summary', 'tags'])
  }
};
</script>

<style lang="scss">
/* Apply a natural box layout model to all elements, but allowing components to change */
html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 16px;
  line-height: 1.5;

  #header {
    height: 50px;
    width: 100%;
    min-width: 500px;
    position: fixed;
    z-index: 100;
    background: #2c3e50;
  }

  div#container {
    display: grid;
    grid-template-columns: auto 500px 500px auto;
    grid-template-areas:
      'head-spacer head-spacer head-spacer head-spacer'
      '.           photos      tags                  .'
      '.           photos      people                .'
      '.           map         summary               .';

    #head-spacer {
      grid-area: head-spacer;
      height: 50px;
    }
    #photos {
      grid-area: photos;
      width: 500px;
    }
    #tags {
      grid-area: tags;
      width: 500px;
      min-height: 225px;
    }
    #people {
      grid-area: people;
      width: 500px;
      min-height: 225px;
    }
    #map {
      grid-area: map;
      width: 500px;
    }
    #summary {
      grid-area: summary;
      width: 500px;
      min-height: 350px;
    }
    #footer {
      grid-area: footer;
      height: 30px;
    }
    .grid-item {
      border: solid 1px blue;
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
