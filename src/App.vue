<template>
  <v-app :dark="theme === 'dark'">
    <WelcomeDialog v-model="showWelcome" @theme="changeTheme" />
    <template v-if="!showWelcome">
      <v-toolbar app dense dark color="primary">
        <OpenDialog @click="snack.show = false" />
        <v-toolbar-title>
          Media Organiser
          <span v-if="selectedFile"> - {{ selectedFile }}</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <SaveDialog @done="itemProcessed" />
        <TrashDialog @done="itemProcessed" />
        <SettingsDialog @theme="changeTheme" />
        <HelpDialog />
      </v-toolbar>

      <v-content>
        <router-view :theme="theme"></router-view>
      </v-content>
    </template>
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
import { mapGetters } from 'vuex';
import WelcomeDialog from '@/components/WelcomeDialog.vue';
import SettingsDialog from '@/components/SettingsDialog.vue';
import HelpDialog from '@/components/HelpDialog.vue';
import OpenDialog from '@/components/OpenDialog.vue';
import TrashDialog from '@/components/TrashDialog.vue';
import SaveDialog from '@/components/SaveDialog.vue';

export default {
  name: 'App',
  components: {
    WelcomeDialog,
    SettingsDialog,
    HelpDialog,
    OpenDialog,
    TrashDialog,
    SaveDialog
  },
  data() {
    return {
      showWelcome: !(localStorage.apiKey && localStorage.outputPath),
      showSettings: false,
      saving: false,
      trashing: false,
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
    ...mapGetters(['getCurrent', 'getSnack']),
    selectedFile() {
      return this.getCurrent
        ? this.getCurrent.file.substring(
            this.getCurrent.file.lastIndexOf('/') + 1
          )
        : null;
    }
  },
  watch: {
    showWelcome: {
      immediate: true,
      handler() {
        /* After the app is initialised, display the snackbar */
        if (!this.showWelcome) {
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
    getSnack(val) {
      if (!val) {
        return;
      }
      this.showSnackbar(val.color, val.timeout, val.msg);
    }
  },
  methods: {
    changeTheme(theme) {
      this.theme = theme;
    },
    showSnackbar(color, timeout, msg) {
      this.snack.show = false;
      Vue.nextTick(() => {
        this.snack = { show: true, color, timeout, msg };
      });
    },
    itemProcessed(payload) {
      this.showSnackbar(...payload);
    }
  }
};
</script>

<style lang="scss">
.v-snack {
  z-index: 1;
}
</style>
