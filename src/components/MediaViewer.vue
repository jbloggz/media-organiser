<template>
  <v-carousel
    v-if="getFiles.length"
    :cycle="false"
    :light="theme === 'light'"
    hide-delimiters
    height="450"
    @change="change"
  >
    <v-carousel-item
      v-for="(file, index) in getFiles"
      :key="index"
      :src="`/api/img?file=${file}`"
      contain
    >
    </v-carousel-item>
    <v-chip small disabled color="#616161a0" class="ma-3">
      {{ idx + 1 }}/{{ getFiles.length }}
    </v-chip>
  </v-carousel>
</template>

<script>
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';

export default {
  name: 'MediaViewer',
  props: {
    theme: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      idx: null
    };
  },
  computed: {
    ...mapGetters(['getFiles'])
  },
  methods: {
    ...mapActions(['changeItem']),
    change(index) {
      this.idx = index;
      this.changeItem(index);
    }
  }
};
</script>

<style lang="scss" scoped>
.v-chip {
  position: absolute;
  bottom: 0;
  right: 0;
  min-width: auto;
}
</style>
