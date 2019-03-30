<template>
  <v-app :dark="theme === 'dark'">
    <template v-if="initialised">
      <v-toolbar app dense dark color="primary">
        <v-btn icon>
          <v-icon>folder</v-icon>
        </v-btn>
        <v-toolbar-title>Photo Organiser</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon>save</v-icon>
        </v-btn>
        <SettingsDialog @theme="changeTheme" />
        <v-btn icon>
          <v-icon>help</v-icon>
        </v-btn>
      </v-toolbar>

      <v-content>
        <router-view @loaded="loaded = true"></router-view>
      </v-content>
    </template>
    <LoaderDialog v-if="initialised && !loaded" />
    <WelcomeDialog v-model="initialised" @theme="changeTheme" />
  </v-app>
</template>

<script>
import WelcomeDialog from '@/components/WelcomeDialog.vue';
import SettingsDialog from '@/components/SettingsDialog.vue';
import LoaderDialog from '@/components/LoaderDialog.vue';

export default {
  name: 'App',
  components: {
    LoaderDialog,
    WelcomeDialog,
    SettingsDialog
  },
  data() {
    return {
      initialised: !!localStorage.apiKey,
      loaded: false,
      theme: localStorage.theme ? localStorage.theme : 'dark'
    };
  },
  methods: {
    changeTheme(theme) {
      this.theme = theme;
    }
  }
};
</script>

<style lang="scss"></style>
