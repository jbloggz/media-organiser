<template>
  <div class="base-tag" :class="classes" @click="$emit('toggle')">
    <span v-if="tag.selected"><i class="fas fa-check"></i></span> {{ tag.name }}
    <span @click.stop="$emit('remove')"
      ><i class="fas fa-times fa-sm" title="Delete"></i
    ></span>
  </div>
</template>

<script>
export default {
  name: 'BaseTag',
  props: {
    tag: {
      required: true,
      type: Object,
      validator(val) {
        return 'name' in val && 'selected' in val;
      }
    }
  },
  computed: {
    classes() {
      return {
        selected: this.tag.selected
      };
    }
  }
};
</script>

<style lang="scss" scoped>
div.base-tag {
  position: relative;
  display: inline-block;
  color: var(--text-invert);
  background-color: var(--text);
  border: 1px solid var(--border);
  opacity: 0.4;
  margin: 5px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 6px 15px;
  font-size: 14px;
  line-height: 1.42857143;
  border-radius: 4px;
  user-select: none;

  .fa-times {
    display: none;

    &:hover {
      color: var(--border);
    }
  }

  &.selected {
    opacity: 1;
    &:hover {
      background-color: var(--hover);
    }
  }

  &:hover {
    .fa-times {
      display: block;
      position: absolute;
      top: 2px;
      right: 4px;
    }
  }
}
</style>
