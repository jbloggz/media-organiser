<template>
  <v-dialog v-model="dialog" max-width="300px">
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        title="Save"
        :disabled="!getCurrent"
        :loading="saving"
        @click.stop="checkItem"
      >
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Confirm</span>
      </v-card-title>
      <v-card-text>
        {{ msg }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">No</v-btn>
        <v-btn @click="save">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SaveDialog',
  data() {
    return {
      dialog: false,
      saving: false,
      msg: ''
    };
  },
  computed: {
    ...mapGetters(['getFiles', 'getCurrent'])
  },
  methods: {
    ...mapActions(['saveCurrent']),
    checkItem() {
      const item = this.getCurrent;
      if (item.tags.length === 0) {
        this.msg =
          'Warning: No tags selected. Are you sure you want to save this item?';
        this.dialog = true;
      } else if (item.people.length === 0) {
        this.msg =
          'Warning: No people selected. Are you sure you want to save this item?';
        this.dialog = true;
      } else {
        this.save();
      }
    },
    save() {
      this.dialog = false;
      this.saving = true;
      this.saveCurrent()
        .then(() => {
          if (this.getFiles.length > 0) {
            this.$emit('done', ['success', 4000, 'Successfully saved']);
          } else {
            this.$emit('done', [
              'success',
              4000,
              "All items processed. Click the 'Open' button to select another folder"
            ]);
          }
          this.saving = false;
        })
        .catch(msg => {
          this.$emit('done', ['error', 4000, msg]);
          this.saving = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
