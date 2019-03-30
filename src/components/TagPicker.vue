<template>
  <div class="tag-picker">
    <v-combobox
      v-model="items"
      :items="tagOptions(type)"
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
      v-for="tag in suggestedTags(type)"
      :key="tag"
      :value="!items.includes(tag)"
      class="suggested-tags"
      @click="addTag(tag)"
    >
      {{ tag }}
    </v-chip>
  </div>
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
      items: []
    };
  },
  computed: {
    ...mapGetters(['tags', 'suggestedTags', 'tagOptions']),
    newTags() {
      return this.tags(this.type);
    }
  },
  watch: {
    newTags: {
      immediate: true,
      handler(value) {
        this.items = value;
      }
    }
  },
  methods: {
    ...mapActions(['updateTags']),
    addTag(name) {
      if (!this.items.includes(name)) {
        this.syncTags([...this.items, name]);
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
}
</style>
