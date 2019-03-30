<template>
  <v-dialog :value="true" :content-class="classes" fullscreen persistent>
    <v-container fill-height>
      <v-layout row justify-center align-center>
        <v-progress-circular
          color="primary"
          indeterminate
          :size="70"
          :width="7"
        ></v-progress-circular>
      </v-layout>
    </v-container>
  </v-dialog>
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
.loading-dialog-dark {
  background-color: #303030;
}
.loading-dialog-light {
  background-color: #ffffff;
}
</style>
