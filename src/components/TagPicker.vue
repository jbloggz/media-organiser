<template>
  <div>
    <div>
      <BaseInputDropdown
        :list="tagOptions(tagType)"
        :placeholder="placeholder"
        @selected="addTag"
      ></BaseInputDropdown>
    </div>
    <transition-group name="tag-transition">
      <BaseTag
        v-for="tag in tagList"
        :key="tag.id"
        :tag="tag"
        @click.native="tagClicked($event, tag)"
      ></BaseTag>
    </transition-group>
  </div>
</template>

<script>
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
    },
    tagList: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['tagOptions']),
    placeholder() {
      return `Add ${this.tagType}...`;
    }
  },
  methods: {
    ...mapActions(['setTag']),
    tagClicked(event, tag) {
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
