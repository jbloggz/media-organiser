<template>
  <v-dialog v-model="dialog" max-width="300px">
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        title="Trash"
        :disabled="!getCurrent"
        :loading="trashing"
        v-on="on"
      >
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Confirm</span>
      </v-card-title>
      <v-card-text>
        Are you sure you want to trash this item?
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">No</v-btn>
        <v-btn @click="trash">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'TrashDialog',
  data() {
    return {
      dialog: false,
      trashing: false
    };
  },
  computed: {
    ...mapGetters(['getFiles', 'getCurrent'])
  },
  methods: {
    ...mapActions(['trashCurrent']),
    trash() {
      this.dialog = false;
      this.trashing = true;
      this.trashCurrent()
        .then(() => {
          if (this.getFiles.length > 0) {
            this.$emit('done', ['success', 4000, 'Successfully trashed']);
          } else {
            this.$emit('done', [
              'success',
              4000,
              "All items processed. Click the 'Open' button to select another folder"
            ]);
          }
          this.trashing = false;
        })
        .catch(resp => {
          this.$emit('done', ['error', 4000, resp.response.data]);
          this.trashing = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
