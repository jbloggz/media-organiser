<template>
  <v-layout row justify-center align-center :class="classes" class="progress">
    <v-progress-circular
      color="primary"
      indeterminate
      :size="70"
      :width="7"
    ></v-progress-circular>
  </v-layout>
</template>

<script>
export default {
  name: 'LoaderDialog',
  computed: {
    classes() {
      return localStorage.theme === 'light'
        ? ['loading-dialog-light']
        : ['loading-dialog-dark'];
    }
  }
};
</script>

<style lang="scss">
.progress {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;

  &.loading-dialog-dark {
    background-color: #303030;
  }

  &.loading-dialog-light {
    background-color: #ffffff;
  }
}
</style>
