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
    cursor: pointer;
  }

  div.selected-photo {
    text-align: center;
    width: 500px;
    height: 450px;
    img {
      width: 500px;
      height: 450px;
      object-fit: contain;
    }
  }

  div.photo-list {
    width: 500px;
    height: 0;
    white-space: nowrap;
    overflow: hidden;
    background: black;
    position: absolute;
    bottom: 0;
    transition: 0.5s;

    img {
      opacity: 0.5;
      transition: 0.5s;
      width: 100px;
      height: 100px;
      object-fit: cover;

      &:hover {
        opacity: 1;
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
