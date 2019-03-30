<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>settings</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Settings!</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-form ref="form" @submit.prevent="submit">
        <v-card-text>
          Welcome to the Photo Organiser web app! To get started, please enter a
          valid Google Maps API Key:
          <v-text-field
            v-model="key"
            :rules="rules"
            label="API Key"
            class="mt-3"
            @focus="warn = true"
          ></v-text-field>
          <v-switch
            v-model="isDark"
            :label="isDark ? 'Dark Theme' : 'Light Theme'"
            @change="$emit('theme', theme)"
          ></v-switch>
        </v-card-text>
        <v-card-actions class="px-3 pb-3">
          <v-layout align-center>
            <span v-if="warn" class="warning--text pr-4">
              WARNING: Changing the API Key will reload the App
            </span>
            <v-spacer></v-spacer>
            <v-btn type="submit" flat>
              Save
            </v-btn>
          </v-layout>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SettingsDialog',
  data() {
    return {
      key: localStorage.apiKey,
      isDark: localStorage.theme === 'dark',
      rules: [v => (v && v.length >= 20) || 'Invalid Key'],
      warn: false,
      dialog: false
    };
  },
  computed: {
    theme() {
      return this.isDark ? 'dark' : 'light';
    }
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        const oldKey = localStorage.apiKey;
        localStorage.apiKey = this.key;
        localStorage.theme = this.theme;
        if (oldKey !== this.key) {
          window.location.reload();
        } else {
          this.dialog = false;
        }
      }
    },
    warnApiKey() {}
  }
};
</script>
