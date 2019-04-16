<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-text-field
      v-model="key"
      :rules="[rules.key]"
      prepend-icon="mdi-key-variant"
      label="API Key"
    ></v-text-field>

    <v-menu lazy transition="slide-y-transition" full-width max-height="300px">
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="outputPath"
          :rules="[rules.path]"
          prepend-icon="mdi-folder"
          label="Output Folder"
          v-on="on"
        ></v-text-field>
      </template>
      <v-card class="pa-2">
        <v-treeview
          :items="paths"
          :load-children="loadPath"
          :open.sync="expanded_paths"
          loading-icon="mdi-loading"
          activatable
          transition
          @update:active="setOutputPath"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon>
              {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
            </v-icon>
          </template>
        </v-treeview>
      </v-card>
    </v-menu>

    <v-text-field
      v-model="tzShift"
      :rules="[rules.tzShift]"
      prepend-icon="mdi-map-clock"
      label="Camera Timezone offset"
    ></v-text-field>

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
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  name: 'SettingsForm',
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
      tzShift: localStorage.tzShift === '0' ? '' : localStorage.tzShift,
      expanded_paths: [],
      paths: [{ id: '/', name: '/', children: [] }],
      error: null,
      rules: {
        key: v => (v && v.length >= 20) || 'Invalid Key',
        path: v => (v && v.length >= 0) || 'An output folder must be provided',
        tzShift: v => {
          const pattern = /^-?[0-9]*$/;
          return v == null || pattern.test(v) || 'Offset must be a number';
        }
      }
    };
  },
  computed: {
    theme() {
      return this.isDark ? 'dark' : 'light';
    }
  },
  methods: {
    ...mapActions(['updateTzShift']),
    setOutputPath(path) {
      this.outputPath = path;
    },
    loadPath(item) {
      axios
        .get(`/api/ls?path=${item.id}`)
        .then(json => {
          item.children.push(...json.data);
          this.expanded_paths.push(item.id);
        })
        .catch(msg => {
          this.error = msg;
        });
    },
    submit() {
      if (this.$refs.form.validate()) {
        localStorage.apiKey = this.key;
        localStorage.theme = this.theme;
        localStorage.outputPath = this.outputPath;
        localStorage.tzShift = this.tzShift || 0;
        this.updateTzShift(this.tzShift ? parseInt(this.tzShift) : 0);
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
