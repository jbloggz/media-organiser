<template>
  <div class="photo-viewer">
    <div class="selected-photo">
      <img v-if="selectedPhoto" :src="selectedPhoto.file" />
    </div>
    <div class="photo-list">
      <img
        v-for="(photo, index) in photos"
        :key="index"
        :style="imgStyle"
        :src="photo.file"
        @click="setPhoto(index)"
      />
    </div>
    <button v-if="scrollIdx > 0" @click="backward">Backward</button>
    <button v-if="scrollIdx < photos.length - 5" @click="forward">
      Forward
    </button>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';

export default {
  name: 'PhotoViewer',
  data() {
    return {
      scrollIdx: 0
    };
  },
  computed: {
    ...mapGetters(['photos', 'selectedPhoto']),
    imgStyle() {
      return {
        transform: `translate(${-this.scrollIdx * 100}px)`
      };
    }
  },
  mounted() {
    Vue.nextTick(() => this.$emit('loaded'));
  },
  methods: {
    ...mapActions(['setPhoto']),
    forward() {
      this.scrollIdx += 5;
      if (this.scrollIdx > this.photos.length - 5) {
        this.scrollIdx = Math.max(this.photos.length - 5, 0);
      }
    },
    backward() {
      this.scrollIdx -= 5;
      if (this.scrollIdx < 0) {
        this.scrollIdx = 0;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
div.photo-viewer {
  position: relative;

  &:hover div.photo-list {
    height: 100px;
  }

  div.selected-photo {
    text-align: center;
    width: 100%;
    height: 449px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 5px;
      object-fit: contain;
    }
  }

  div.photo-list {
    width: 100%;
    height: 0;
    white-space: nowrap;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    transition: 0.5s;
    cursor: pointer;

    img {
      transition: 0.5s;
      filter: brightness(50%);
      width: 20%;
      height: 100px;
      object-fit: cover;

      &:hover {
        filter: brightness(100%);
        transition: 0.2s;
        cursor: pointer;
      }
    }
  }
  button {
    position: relative;
    top: -50px;
  }
}
</style>
