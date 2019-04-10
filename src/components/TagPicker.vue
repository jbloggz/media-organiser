<template>
  <div v-if="allowEdit" div class="tag-picker">
    <v-combobox
      v-model="selectedTags"
      :items="getTagOptions(type)"
      :placeholder="`Add ${type}...`"
      :prepend-inner-icon="icon"
      chips
      clearable
      deletable-chips
      multiple
      class="mt-0"
      @input="syncTags"
    />
    <v-card-title class="pa-0 pb-1">
      <h3>Suggested {{ type }}</h3>
    </v-card-title>
    <v-chip
      v-for="tag in getSuggestedTags(type)"
      :key="tag"
      :value="!selectedTags.includes(tag)"
      class="suggested-tags"
      @click="addTag(tag)"
    >
      {{ tag }}
    </v-chip>
  </div>
  <v-container v-else fill-height class="tag-picker">
    <v-layout row wrap align-center justify-center>
      <div class="tag-progress">
        <v-progress-circular
          color="primary"
          indeterminate
          :size="50"
          :width="5"
        ></v-progress-circular>
      </div>
      <p>Loading tags. Please wait...</p>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';

export default {
  name: 'TagPicker',
  props: {
    icon: {
      required: true,
      type: String
    },
    type: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      selectedTags: []
    };
  },
  computed: {
    ...mapGetters(['getTags', 'getSuggestedTags', 'getTagOptions']),
    vuexGetTags() {
      return this.getTags(this.type);
    },
    allowEdit() {
      if (this.type === 'tags') {
        return this.getSuggestedTags(this.type) !== null;
      } else {
        return true;
      }
    }
  },
  watch: {
    vuexGetTags: {
      immediate: true,
      handler(val) {
        this.selectedTags = val;
      }
    }
  },
  methods: {
    ...mapActions(['updateTags']),
    addTag(name) {
      if (!this.selectedTags.includes(name)) {
        this.syncTags([...this.selectedTags, name]);
      }
    },
    syncTags(list) {
      this.updateTags({ type: this.type, list });
    }
  }
};
</script>

<style lang="scss">
.tag-picker {
  .suggested-tags {
    .v-chip__content {
      cursor: pointer;
    }
  }

  .v-input__prepend-inner {
    margin-top: 7px;
    margin-right: 7px;
  }

  .tag-progress {
    width: 100%;
    text-align: center;
  }
}
</style>
