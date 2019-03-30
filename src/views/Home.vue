<template>
  <v-container class="pa-2">
    <v-layout row wrap>
      <v-flex d-flex xs12 lg6>
        <v-layout column>
          <v-flex d-flex>
            <v-card class="ma-1">
              <PhotoViewer />
            </v-card>
          </v-flex>
          <v-flex d-flex>
            <v-card class="ma-1">
              <MapPicker
                v-if="apiKey"
                :location="location"
                :api-key="apiKey"
                @loaded="$emit('loaded')"
              />
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex d-flex xs12 lg6>
        <v-layout column>
          <v-flex d-flex>
            <v-card class="ma-1 px-4 pb-3">
              <TagPicker
                icon="local_offer"
                type="tags"
                :list="tags('tags')"
                :options="tagOptions('tags')"
              />
            </v-card>
          </v-flex>
          <v-flex d-flex>
            <v-card class="ma-1 px-4 pb-3">
              <TagPicker
                icon="group"
                type="people"
                :list="tags('people')"
                :options="tagOptions('people')"
              />
            </v-card>
          </v-flex>
          <v-card class="ma-1 pa-4">
            <AttributeViewer :data="summary" />
          </v-card>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

import MapPicker from '@/components/MapPicker.vue';
import TagPicker from '@/components/TagPicker.vue';
import AttributeViewer from '@/components/AttributeViewer.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

export default {
  name: 'App',
  components: {
    MapPicker,
    TagPicker,
    AttributeViewer,
    PhotoViewer
  },
  computed: {
    ...mapGetters([
      'location',
      'summary',
      'tags',
      'suggestedTags',
      'tagOptions'
    ]),
    apiKey() {
      return localStorage.apiKey;
    }
  }
};
</script>

<style lang="scss"></style>
