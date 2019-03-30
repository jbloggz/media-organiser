import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import { pretty_size, pretty_gps } from '@/util.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    index: null,
    photos: [
      {
        file: require('./assets/test1.jpg'),
        size: 8885509,
        width: 6000,
        height: 4000,
        timestamp: 1551152937,
        lat: -31.243316006616393,
        lng: 147.83203125,
        brand: 'Canon',
        model: 'Canon EOS 750D',
        exposure: '1/60',
        iso: 213,
        aperture: 1.4,
        focal_length: 55,
        people: ['Josef Barnes', 'Katie Barnes', 'Ivy Barnes'],
        tags: ['happy', 'ocean', 'beach']
      },
      {
        file: require('./assets/test2.jpg'),
        size: 885509,
        width: 3000,
        height: 2000,
        timestamp: 1551172937,
        lat: null,
        lng: null,
        brand: 'LGE',
        model: 'Nexus 5',
        exposure: '1/200',
        iso: 1000,
        aperture: 3.5,
        focal_length: 18,
        people: ['Dexter Barnes', 'Hayley Darke'],
        tags: ['animal', 'dog', 'woman']
      },
      {
        file: require('./assets/test3.jpg'),
        size: 12345678,
        width: 1234,
        height: 5678,
        timestamp: 1550152937,
        lat: -29.6687,
        lng: 153.109,
        brand: 'Google',
        model: 'Pixel',
        exposure: '10',
        iso: 12600,
        aperture: 2.8,
        focal_length: 35,
        people: ['Ivy Barnes', 'Molly Barnes', 'Dexter Barnes'],
        tags: ['baby', 'animal', 'tree']
      }
    ],
    tags: ['animal', 'baby', 'beach', 'dog', 'happy', 'ocean', 'tree', 'woman'],
    people: [
      'Dexter Barnes',
      'Ivy Barnes',
      'Josef Barnes',
      'Katie Barnes',
      'Molly Barnes',
      'Hayley Darke'
    ]
  },
  getters: {
    photos(state) {
      return _.cloneDeep(state.photos);
    },
    selectedIndex(state) {
      return state.index;
    },
    selectedPhoto(state) {
      return state.index !== null && state.index < state.photos.length
        ? state.photos[state.index]
        : null;
    },
    location(state, getters) {
      const photo = getters.selectedPhoto;
      return photo
        ? {
            lat: photo.lat,
            lng: photo.lng
          }
        : null;
    },
    tags: (state, getters) => type => {
      const photo = getters.selectedPhoto;
      return photo && ['tags', 'people'].includes(type)
        ? _.cloneDeep(photo[type])
        : [];
    },
    tagOptions: state => type => {
      return ['tags', 'people'].includes(type) ? _.cloneDeep(state[type]) : [];
    },
    suggestedTags: () => type => {
      return ['tags', 'people'].includes(type)
        ? ['foo_' + type, 'bar_' + type]
        : [];
    },
    summary(state, getters) {
      const photo = getters.selectedPhoto;
      if (!photo) return {};

      return {
        Size: `${pretty_size(photo.size)} (${photo.size})`,
        Dimensions: `${photo.width} x ${photo.height}`,
        Time: new Date(photo.timestamp * 1000).toLocaleString(),
        Location: `${pretty_gps(photo.lat, photo.lng)}`,
        Camera: `${photo.brand} (${photo.model})`,
        Exposure: photo.exposure,
        ISO: photo.iso,
        Aperture: photo.aperture,
        'Focal Length': photo.focal_length,
        Tags: `(${photo.tags.length}) ${photo.tags.join(', ')}`,
        People: `(${photo.people.length}) ${photo.people.join(', ')}`
      };
    }
  },
  mutations: {
    SET_PHOTO(state, index) {
      state.index = index;
    },
    SET_LOCATION(_, payload) {
      payload.photo.lat = payload.lat;
      payload.photo.lng = payload.lng;
    },
    SET_TAGS(state, payload) {
      payload.photo[payload.type] = payload.list.sort();
    }
  },
  actions: {
    updateLocation(context, loc) {
      const photo = context.getters.selectedPhoto;
      if (!photo) return;

      /* Do some hardcore validation before letting this through */
      if (
        photo &&
        loc &&
        typeof loc === 'object' &&
        loc.hasOwnProperty('lat') &&
        typeof loc.lat === 'number' &&
        loc.hasOwnProperty('lng') &&
        typeof loc.lng === 'number'
      ) {
        context.commit('SET_LOCATION', { photo, ...loc });
      }
    },
    setPhoto(context, index) {
      if (context.state.photos[index]) context.commit('SET_PHOTO', index);
      else context.commit('SET_PHOTO', null);
    },
    updateTags(context, payload) {
      const photo = context.getters.selectedPhoto;

      /* Do some hardcore validation before letting this through */
      if (
        payload.hasOwnProperty('type') &&
        typeof payload.type === 'string' &&
        ['tags', 'people'].includes(payload.type) &&
        payload.hasOwnProperty('list') &&
        Array.isArray(payload.list) &&
        payload.list.every(tag => typeof tag === 'string')
      ) {
        context.commit('SET_TAGS', {
          photo,
          type: payload.type,
          list: payload.list
        });
      }
    }
  },
  strict: true
});
