<template>
  <v-dialog :value="!initialised" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Welcome!</span>
      </v-card-title>
      <v-form ref="form" @submit.prevent="submit">
        <v-card-text>
          Welcome to the Photo Organiser web app! To get started, please enter a
          valid Google Maps API Key:
          <v-text-field
            v-model="key"
            :rules="rules"
            label="API Key"
          ></v-text-field>
          <v-switch
            v-model="isDark"
            :label="isDark ? 'Dark Theme' : 'Light Theme'"
            @change="$emit('theme', theme)"
          ></v-switch>
        </v-card-text>
        <v-card-actions class="px-3 pb-3">
          <v-layout justify-end>
            <v-btn type="submit" flat>
              Start
            </v-btn>
          </v-layout>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'WelcomeDialog',
  model: {
    prop: 'initialised',
    event: 'initialised'
  },
  props: {
    initialised: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      key: null,
      isDark: localStorage.theme === 'dark',
      rules: [v => (v && v.length >= 20) || 'Invalid Key']
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
        localStorage.apiKey = this.key;
        localStorage.theme = this.theme;
        this.$emit('initialised', true);
      }
    }
  }
};
</script>

<style lang="scss"></style>
