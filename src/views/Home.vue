<template>
  <v-container v-if="hasPhotos" fluid class="pa-2">
    <v-layout row wrap>
      <v-flex d-flex xs12 lg6>
        <v-layout column>
          <v-card class="ma-1">
            <PhotoViewer :theme="theme" />
          </v-card>
          <v-card class="ma-1">
            <MapPicker
              v-if="apiKey"
              :location="getLocation"
              :api-key="apiKey"
              @loaded="mapsLoaded = true"
            />
          </v-card>
        </v-layout>
      </v-flex>
      <v-flex d-flex xs12 lg6>
        <v-layout column>
          <v-flex d-flex>
            <v-card class="ma-1 px-4 pb-3">
              <TagPicker icon="mdi-tag-multiple" type="tags" />
            </v-card>
          </v-flex>
          <v-flex d-flex>
            <v-card class="ma-1 px-4 pb-3">
              <TagPicker icon="mdi-account-multiple" type="people" />
            </v-card>
          </v-flex>
          <v-card class="ma-1 pa-4">
            <AttributeViewer :data="getSummary" />
          </v-card>
        </v-layout>
      </v-flex>
    </v-layout>
    <LoaderDialog v-if="!mapsLoaded" />
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

import LoaderDialog from '@/components/LoaderDialog.vue';
import MapPicker from '@/components/MapPicker.vue';
import TagPicker from '@/components/TagPicker.vue';
import AttributeViewer from '@/components/AttributeViewer.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

export default {
  name: 'App',
  components: {
    LoaderDialog,
    MapPicker,
    TagPicker,
    AttributeViewer,
    PhotoViewer
  },
  props: {
    theme: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      mapsLoaded: false
    };
  },
  computed: {
    ...mapGetters(['getFiles', 'getLocation', 'getSummary']),
    apiKey() {
      return localStorage.apiKey;
    },
    hasPhotos() {
      return this.getFiles.length > 0;
    }
  },
  watch: {
    hasPhotos(val) {
      if (!val) {
        this.mapsLoaded = false;
      }
    }
  }
};
</script>

<style lang="scss"></style>
