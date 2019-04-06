<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn icon title="Open" v-on="on" @click="$emit('click')">
        <v-icon>mdi-folder</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Open Folder</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-card light height="400px" class="file-list">
          <v-treeview
            v-if="items"
            :items="items"
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
          <div v-else-if="!error" class="pa-4">
            <v-progress-circular
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>
        </v-card>
      </v-card-text>
      <v-card-actions class="px-3 pb-3">
        <v-layout align-center>
          <span :class="{ 'error--text': error }">
            {{ error || path }}
          </span>
          <v-spacer></v-spacer>
          <v-btn
            flat
            :loading="loading"
            :disabled="path === null"
            @click="open"
          >
            Open
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'OpenDialog',
  data() {
    return {
      dialog: false,
      items: null,
      path: null,
      loading: false,
      error: false
    };
  },
  watch: {
    dialog(isOpen) {
      this.path = null;
      this.loading = false;
      this.items = null;
      this.error = null;
      if (isOpen) {
        this.loadPaths()
          .then(paths => {
            this.items = paths;
          })
          .catch(msg => {
            this.error = msg;
          });
      }
    }
  },
  methods: {
    ...mapActions(['loadPaths', 'loadPhotos']),
    setPath(path) {
      if (path.length === 1) {
        this.path = path[0];
      }
    },
    open() {
      this.loading = true;
      this.error = null;
      this.loadPhotos(this.path)
        .then(() => {
          this.dialog = false;
        })
        .catch(msg => {
          this.loading = false;
          this.error = msg;
        });
    }
  }
};
</script>

<style lang="scss">
.file-list {
  overflow-y: auto;

  .v-treeview-node__content {
    cursor: pointer;
  }
}
</style>
