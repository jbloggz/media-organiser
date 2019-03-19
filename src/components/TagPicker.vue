<template>
  <div>
    <div>
      <BaseInputDropdown
        :list="tagOptions(tagType)"
        :placeholder="placeholder"
        @add="addTag"
      ></BaseInputDropdown>
    </div>
    <transition-group name="tag-transition">
      <BaseTag
        v-for="tag in tags(tagType)"
        :key="tag.id"
        :tag="tag"
        @toggle="toggleTag(tag)"
        @remove="removeTag(tag)"
      ></BaseTag>
    </transition-group>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';
import BaseInputDropdown from '@/components/BaseInputDropdown.vue';
import BaseTag from '@/components/BaseTag.vue';

export default {
  name: 'TagPicker',
  components: {
    BaseInputDropdown,
    BaseTag
  },
  props: {
    tagType: {
      required: true,
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['tagOptions', 'tags']),
    placeholder() {
      return `Add ${this.tagType}...`;
    }
  },
  mounted() {
    Vue.nextTick(() => this.$emit('loaded'));
  },
  methods: {
    ...mapActions(['setTag']),
    toggleTag(tag) {
      this.setTag({
        tagType: this.tagType,
        name: tag.name,
        selected: !tag.selected
      });
    },
    addTag(name) {
      this.setTag({
        tagType: this.tagType,
        name,
        selected: true
      });
    },
    removeTag(tag) {
      this.setTag({
        tagType: this.tagType,
        name: tag.name,
        selected: null
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/* Vue transition classes, applied to the BaseTag root node */
div.base-tag {
  transition: all 0.4s;

  &.tag-transition-enter,
  &.tag-transition-leave-to {
    opacity: 0;
  }
  &.tag-transition-leave-active {
    display: none;
  }
}
</style>
