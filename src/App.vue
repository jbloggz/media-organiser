<template>
  <v-app :dark="theme === 'dark'">
    <template v-if="initialised">
      <v-toolbar app dense dark color="primary">
        <OpenDialog @click="snack.show = false" />
        <v-toolbar-title>Photo Organiser</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon title="Save" :loading="saving" @click="save">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
        <SettingsDialog @theme="changeTheme" />
        <HelpDialog />
      </v-toolbar>

      <v-content>
        <router-view :theme="theme"></router-view>
      </v-content>
    </template>
    <WelcomeDialog v-model="initialised" @theme="changeTheme" />
    <v-snackbar
      v-model="snack.show"
      :timeout="snack.timeout"
      :color="snack.color"
      class="mt-5"
      top
    >
      {{ snack.msg }}
      <v-btn flat fab @click="snack.show = false">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import WelcomeDialog from '@/components/WelcomeDialog.vue';
import SettingsDialog from '@/components/SettingsDialog.vue';
import HelpDialog from '@/components/HelpDialog.vue';
import OpenDialog from '@/components/OpenDialog.vue';

export default {
  name: 'App',
  components: {
    WelcomeDialog,
    SettingsDialog,
    HelpDialog,
    OpenDialog
  },
  data() {
    return {
      initialised: !!localStorage.apiKey,
      saving: false,
      theme: localStorage.theme ? localStorage.theme : 'dark',
      snack: {
        show: false,
        color: null,
        timeout: 0,
        msg: null
      }
    };
  },
  computed: {
    ...mapGetters(['getFiles'])
  },
  watch: {
    initialised: {
      immediate: true,
      handler() {
        /* After the app is initialised, display the snackbar */
        setTimeout(() => {
          this.showSnackbar(
            null,
            0,
            "To begin, click the 'Open' button on the top left"
          );
        }, 1000);
      }
    }
  },
  methods: {
    ...mapActions(['savePhoto']),
    changeTheme(theme) {
      this.theme = theme;
    },
    showSnackbar(color, timeout, msg) {
      this.snack.show = false;
      Vue.nextTick(() => {
        this.snack = { show: true, color, timeout, msg };
      });
    },
    save() {
      this.saving = true;
      this.savePhoto()
        .then(() => {
          if (this.getFiles.length > 0) {
            this.showSnackbar('success', 4000, 'Successfully saved photo');
          } else {
            this.showSnackbar(
              'success',
              0,
              "All photos saved. Click the 'Open' button to select another folder"
            );
          }
          this.saving = false;
        })
        .catch(msg => {
          this.showSnackbar('error', 4000, msg);
          this.saving = false;
        });
    }
  }
};
</script>

<style lang="scss">
.v-snack {
  z-index: inherit;
}
</style>
