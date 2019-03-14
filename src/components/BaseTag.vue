<template>
  <div class="base-tag" :class="classes">
    {{ tag.name }}
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
div {
  display: inline-block;
  color: #333;
  background-color: #fff;
  margin: 5px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid #ccc;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  border-radius: 4px;
  user-select: none;

  &.selected {
    color: #fff;
    background-color: #5cb85c;
    border-color: #4cae4c;

    &:hover {
      background-color: #449d44;
      border-color: #398439;
    }
  }

  &:hover {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
  }
}
</style>
