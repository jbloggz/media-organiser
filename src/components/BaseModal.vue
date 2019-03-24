<template>
  <div v-if="show" class="modal" :style="{ background: background }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: {
      required: true,
      type: Boolean
    },
    background: {
      required: false,
      type: String,
      default: '#00000080'
    }
  }
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
