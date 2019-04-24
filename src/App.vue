<template>
  <v-app :dark="theme === 'dark'">
    <WelcomeDialog v-model="showWelcome" @theme="changeTheme" />
    <template v-if="!showWelcome">
      <v-toolbar app dense dark color="primary">
        <OpenDialog @click="snack.show = false" />
        <v-toolbar-title>
          Photo Organiser
          <span v-if="selectedFile"> - {{ selectedFile }}</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          v-if="selectedFile"
          icon
          title="Save"
          :loading="saving"
          @click="save"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
        <v-btn
          v-if="selectedFile"
          icon
          title="Trash"
          :loading="trashing"
          @click="trash"
        >
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
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
    ...mapGetters(['getFiles', 'getPhoto', 'getSnack']),
    selectedFile() {
      return this.getPhoto
        ? this.getPhoto.file.substring(this.getPhoto.file.lastIndexOf('/') + 1)
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
    ...mapActions(['savePhoto', 'trashPhoto']),
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
              "All photos processed. Click the 'Open' button to select another folder"
            );
          }
          this.saving = false;
        })
        .catch(msg => {
          this.showSnackbar('error', 4000, msg);
          this.saving = false;
        });
    },
    trash() {
      this.trashing = true;
      this.trashPhoto()
        .then(() => {
          if (this.getFiles.length > 0) {
            this.showSnackbar('success', 4000, 'Successfully trashed photo');
          } else {
            this.showSnackbar(
              'success',
              0,
              "All photos processed. Click the 'Open' button to select another folder"
            );
          }
          this.trashing = false;
        })
        .catch(msg => {
          this.showSnackbar('error', 4000, msg);
          this.trashing = false;
        });
    }
  }
};
</script>

<style lang="scss">
.v-snack {
  z-index: 1;
}
</style>
