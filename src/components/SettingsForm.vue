<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-text-field
      v-model="key"
      :rules="rules.key"
      prepend-icon="mdi-key-variant"
      label="API Key"
    ></v-text-field>

    <v-menu lazy transition="slide-y-transition" full-width max-height="300px">
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="outputPath"
          :rules="rules.path"
          prepend-icon="mdi-folder"
          label="Output Folder"
          v-on="on"
          @click="getPaths"
        ></v-text-field>
      </template>
      <v-card class="pa-2">
        <v-treeview
          v-if="paths"
          :items="paths"
          activatable
          hoverable
          transition
          @update:active="setPath"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon>
              {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
            </v-icon>
          </template>
        </v-treeview>
        <v-progress-circular
          v-else
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-card>
    </v-menu>

    <v-switch
      v-model="isDark"
      :label="isDark ? 'Dark Theme' : 'Light Theme'"
      @change="$emit('theme', theme)"
    ></v-switch>
    <v-layout justify-end>
      <v-btn type="submit" flat>
        {{ button }}
      </v-btn>
    </v-layout>
  </v-form>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'WelcomeDialog',
  props: {
    button: {
      type: String,
      required: false,
      default: 'Save'
    }
  },
  data() {
    return {
      key: localStorage.apiKey || null,
      isDark: localStorage.theme !== 'light',
      outputPath: localStorage.outputPath || null,
      paths: null,
      error: null,
      rules: {
        key: [v => (v && v.length >= 20) || 'Invalid Key'],
        path: [v => (v && v.length >= 0) || 'An output folder must be provided']
      }
    };
  },
  computed: {
    theme() {
      return this.isDark ? 'dark' : 'light';
    }
  },
  methods: {
    ...mapActions(['loadPaths']),
    getPaths() {
      this.paths = null;
      this.loadPaths()
        .then(paths => {
          this.paths = paths;
        })
        .catch(msg => {
          this.error = msg;
        });
    },
    setPath(path) {
      if (path.length === 1) {
        this.outputPath = path[0];
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        localStorage.apiKey = this.key;
        localStorage.theme = this.theme;
        localStorage.outputPath = this.outputPath;
        this.$emit('submit');
      }
    }
  }
};
</script>

<style lang="scss">
.v-treeview-node__content {
  cursor: pointer;
}
</style>
