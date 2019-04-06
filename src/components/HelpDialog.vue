<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn icon title="Help" v-on="on">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">About</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        v0.1.0
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AboutDialog',
  data() {
    return {
      dialog: false
    };
  }
};
</script>
