<template>
  <v-dialog :value="show" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Welcome!</span>
      </v-card-title>
      <v-card-text>
        <p>
          Welcome to the Photo Organiser web app! To get started, please enter a
          valid Google Maps API Key and an output folder for saving photos:
        </p>
        <SettingsForm
          button="Start"
          @submit="$emit('show', false)"
          @theme="$emit('theme', $event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsForm from '@/components/SettingsForm.vue';

export default {
  name: 'WelcomeDialog',
  components: {
    SettingsForm
  },
  model: {
    prop: 'show',
    event: 'show'
  },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false
    }
  }
};
</script>

<style lang="scss">
.v-treeview-node__content {
  cursor: pointer;
}
</style>
