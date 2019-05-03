<template>
  <v-carousel
    v-if="getMedia.length"
    :cycle="false"
    :light="theme === 'light'"
    hide-delimiters
    height="450"
    @change="change"
  >
    <v-carousel-item
      v-for="(item, index) in getMedia"
      :key="index"
      :src="getImg(item)"
      contain
      class="test"
    >
    </v-carousel-item>
    <v-chip small disabled color="#616161a0" class="ma-3">
      {{ idx + 1 }}/{{ getMedia.length }}
    </v-chip>
    <v-dialog
      v-if="isVideo"
      v-model="dialog"
      content-class="video-dialog text-xs-center"
    >
      <template v-slot:activator="{ on }">
        <v-icon v-on="on">mdi-play-circle-outline</v-icon>
      </template>
      <video v-if="dialog" controls autoplay :src="getVideo">
        <v-card>
          <v-card-text>
            Your browser doesn't support HTML5 video. Here is a
            <a :href="getVideo" download>link to the video</a> instead.
          </v-card-text>
        </v-card>
      </video>
    </v-dialog>
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
      isVideo: false,
      dialog: false,
      idx: null
    };
  },
  computed: {
    ...mapGetters(['getMedia', 'getCurrent']),
    getVideo() {
      const item = this.getCurrent;
      return item ? `/api/video?file=${this.getCurrent.file}` : null;
    }
  },
  watch: {
    getCurrent(item) {
      this.isVideo = false;
      if (item.type === 'video') {
        setTimeout(() => {
          this.isVideo = true;
        }, 300);
      }
    }
  },
  methods: {
    ...mapActions(['changeItem']),
    change(index) {
      this.idx = index;
      this.changeItem(index);
    },
    getImg(item) {
      return item.type === 'image'
        ? `/api/img?file=${item.file}`
        : `/api/poster?file=${item.file}`;
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
.v-icon {
  font-size: 75px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: none;

  opacity: 0.75;

  &:hover {
    opacity: 1;
  }
}
</style>

<style lang="scss">
.v-dialog.video-dialog {
  width: initial;
  box-shadow: none;
}
</style>
