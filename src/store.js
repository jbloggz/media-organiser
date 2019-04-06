import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import util from '@/util.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    index: null,
    photos: [],
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
    getFiles(state) {
      return _.map(state.photos, 'file');
    },
    getPhoto(state) {
      return state.index !== null && state.index < state.photos.length
        ? state.photos[state.index]
        : null;
    },
    getLocation(state, getters) {
      const photo = getters.getPhoto;
      return photo
        ? {
            lat: photo.lat,
            lng: photo.lng
          }
        : null;
    },
    getTags: (state, getters) => type => {
      const photo = getters.getPhoto;
      return photo && ['tags', 'people'].includes(type)
        ? _.cloneDeep(photo[type])
        : [];
    },
    getTagOptions: state => type => {
      return ['tags', 'people'].includes(type) ? _.cloneDeep(state[type]) : [];
    },
    getSuggestedTags: () => type => {
      return ['tags', 'people'].includes(type)
        ? ['foo_' + type, 'bar_' + type]
        : [];
    },
    getSummary(state, getters) {
      const photo = getters.getPhoto;
      if (!photo) return [];

      return [
        {
          title: 'Size',
          value: `${util.pretty_size(photo.size)} (${photo.size})`
        },
        {
          title: 'Dimensions',
          value: `${photo.width} x ${photo.height}`
        },
        {
          key: 'timestamp',
          title: 'Time',
          value: photo.timestamp
        },
        {
          title: 'Location',
          value: `${util.pretty_gps(photo.lat, photo.lng)}`
        },
        { key: 'brand', title: 'Brand', value: photo.brand },
        { key: 'model', title: 'Model', value: photo.model },
        { key: 'exposure', title: 'Exposure', value: photo.exposure },
        { key: 'iso', title: 'ISO', value: photo.iso },
        { key: 'aperture', title: 'Aperture', value: photo.aperture },
        {
          key: 'focal_length',
          title: 'Focal Length',
          value: photo.focal_length
        },
        {
          title: 'Tags',
          value: `(${photo.tags.length}) ${photo.tags.join(', ')}`
        },
        {
          title: 'People',
          value: `(${photo.people.length}) ${photo.people.join(', ')}`
        }
      ];
    }
  },
  mutations: {
    SET_PHOTOS(state, photos) {
      state.photos = photos;
    },
    SET_INDEX(state, index) {
      state.index = index;
    },
    SET_TIMESTAMP(state, payload) {
      payload.photo.timestamp = payload.timestamp;
    },
    SET_LOCATION(state, payload) {
      payload.photo.lat = payload.lat;
      payload.photo.lng = payload.lng;
    },
    SET_TEXT_VALUE(state, payload) {
      payload.photo[payload.key] = payload.value;
    },
    SET_TAGS(state, payload) {
      payload.photo[payload.type] = payload.list.sort();
    },
    SAVE_PHOTO(state) {
      state.photos.splice(state.index, 1);
    }
  },
  actions: {
    loadPaths() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              name: 'Applications :',
              children: [
                { id: 'test', name: 'Calendar : app' },
                { id: 3, name: 'Chrome : app' },
                { id: 4, name: 'Webstorm : app' }
              ]
            },
            {
              id: 5,
              name: 'Documents :',
              children: [
                {
                  id: 6,
                  name: 'vuetify :',
                  children: [
                    {
                      id: 7,
                      name: 'src :',
                      children: [
                        { id: 8, name: 'index : ts' },
                        { id: 9, name: 'bootstrap : ts' }
                      ]
                    }
                  ]
                },
                {
                  id: 10,
                  name: 'material2 :',
                  children: [
                    {
                      id: 11,
                      name: 'src :',
                      children: [
                        { id: 12, name: 'v-btn : ts' },
                        { id: 13, name: 'v-card : ts' },
                        { id: 14, name: 'v-window : ts' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 15,
              name: 'Downloads :',
              children: [
                { id: 16, name: 'October : pdf' },
                { id: 17, name: 'November : pdf' },
                { id: 18, name: 'Tutorial : html' }
              ]
            },
            {
              id: 19,
              name: 'Videos :',
              children: [
                {
                  id: 20,
                  name: 'Tutorials :',
                  children: [
                    { id: 21, name: 'Basic layouts : mp4' },
                    { id: 22, name: 'Advanced techniques : mp4' },
                    { id: 23, name: 'All about app : dir' }
                  ]
                },
                { id: 24, name: 'Intro : mov' },
                { id: 25, name: 'Conference introduction : avi' }
              ]
            }
          ]);
        }, 100);
      });
    },
    loadPhotos(context, path) {
      return new Promise(resolve => {
        setTimeout(() => {
          context.commit('SET_PHOTOS', [
            {
              file: require('./assets/test1.jpg'),
              size: 8885509,
              width: 6000,
              height: 4000,
              timestamp: 1551152937000,
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
              timestamp: 1551172937000,
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
              timestamp: 1550152937000,
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
          ]);
          resolve(path);
        }, 100);
      });
    },
    changePhoto(context, index) {
      if (context.state.photos[index]) context.commit('SET_INDEX', index);
      else context.commit('SET_INDEX', null);
    },
    updateTimestamp(context, timestamp) {
      const photo = context.getters.getPhoto;

      if (photo && typeof timestamp === 'number') {
        context.commit('SET_TIMESTAMP', { photo, timestamp });
      }
    },
    updateLocation(context, loc) {
      const photo = context.getters.getPhoto;
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
    updateTextValue(context, payload) {
      const photo = context.getters.getPhoto;

      if (
        photo &&
        [
          'brand',
          'model',
          'exposure',
          'iso',
          'aperture',
          'focal_length'
        ].includes(payload.key) &&
        typeof payload.value === 'string'
      ) {
        context.commit('SET_TEXT_VALUE', {
          photo,
          key: payload.key,
          value: payload.value
        });
      }
    },
    updateTags(context, payload) {
      const photo = context.getters.getPhoto;

      /* Do some hardcore validation before letting this through */
      if (
        photo &&
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
    },
    savePhoto(context) {
      const photo = context.getters.getPhoto;

      /* A photo must have something set for every field (except people) */
      for (const key of Object.keys(photo)) {
        if (key === 'people') {
          continue;
        } else if (
          !photo[key] ||
          (Array.isArray(photo[key]) && photo[key].length == 0)
        ) {
          return Promise.reject(`Error: Photo is missing a value for '${key}'`);
        }
      }

      return new Promise((resolve, reject) => {
        if (context.state.index !== null) {
          setTimeout(() => {
            context.commit('SAVE_PHOTO');
            resolve(context);
          }, 100);
        } else {
          reject('Error: No photo selected');
        }
      });
    }
  },
  strict: process.env.NODE_ENV !== 'production'
});
