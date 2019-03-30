<template>
  <v-carousel :cycle="false" hide-delimiters height="450" @change="changePhoto">
    <v-carousel-item
      v-for="(photo, index) in photos"
      :key="index"
      :src="photo.file"
      contain
    >
    </v-carousel-item>
    <v-chip small disabled color="#616161a0" class="ma-3">
      {{ idx + 1 }}/{{ photos.length }}
    </v-chip>
  </v-carousel>
</template>

<script>
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';

export default {
  name: 'PhotoViewer',
  data() {
    return {
      idx: null
    };
  },
  computed: {
    ...mapGetters(['photos'])
  },
  methods: {
    ...mapActions(['setPhoto']),
    changePhoto(index) {
      this.idx = index;
      this.setPhoto(index);
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
