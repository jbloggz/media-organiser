<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn icon title="Settings" v-on="on">
        <v-icon>mdi-settings</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Settings</span>
      </v-card-title>
      <v-card-text>
        <SettingsForm
          @submit="dialog = false"
          @theme="$emit('theme', $event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsForm from '@/components/SettingsForm.vue';

export default {
  name: 'SettingsDialog',
  components: {
    SettingsForm
  },
  data() {
    return {
      dialog: false
    };
  }
};
</script>

<style lang="scss">
.v-treeview-node__content {
  cursor: pointer;
}
</style>
