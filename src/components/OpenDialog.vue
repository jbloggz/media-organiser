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
        <v-divider></v-divider>
        <v-card flat height="400px" class="file-list">
          <v-treeview
            :active.sync="active"
            :items="items"
            :load-children="loadPath"
            :open.sync="open"
            loading-icon="mdi-loading"
            activatable
            transition
          >
            <template v-slot:prepend="{ item, open }">
              <v-icon>
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
            </template>
          </v-treeview>
        </v-card>
        <v-divider></v-divider>
      </v-card-text>
      <v-card-actions class="px-3 pb-3">
        <v-layout align-center>
          <span :class="{ 'error--text': error }">
            {{ error || active.length > 0 ? active[0] : '' }}
          </span>
          <v-spacer></v-spacer>
          <v-btn
            flat
            :loading="loading"
            :disabled="active.length === 0"
            @click="openPath"
          >
            Open
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  name: 'OpenDialog',
  data() {
    return {
      dialog: false,
      items: [{ id: '/', name: '/', children: [] }],
      loading: false,
      error: false,
      open: [],
      active: []
    };
  },
  watch: {
    dialog() {
      this.loading = false;
      this.error = null;
      this.open = [];
      this.active = [];
    }
  },
  methods: {
    ...mapActions(['loadPhotos']),
    loadPath(item) {
      axios
        .get(`/api/folder?path=${item.id}`)
        .then(json => {
          item.children.push(...json.data);
          this.open.push(item.id);
        })
        .catch(msg => {
          this.error = msg;
        });
    },
    openPath() {
      this.loading = true;
      this.error = null;
      this.loadPhotos(this.active[0])
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
