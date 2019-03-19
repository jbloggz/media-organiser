import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import { pretty_size, pretty_gps } from '@/util.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    index: 1,
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
        people: [
          { id: 12, name: 'Josef Barnes', selected: true },
          { id: 13, name: 'Katie Barnes', selected: true },
          { id: 14, name: 'Ivy Barnes', selected: false }
        ],
        tags: [
          { id: 15, name: 'happy', selected: true },
          { id: 16, name: 'ocean', selected: true },
          { id: 17, name: 'beach', selected: false }
        ]
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
        people: [
          { id: 1, name: 'Dexter Barnes', selected: true },
          { id: 2, name: 'Hayley Darke', selected: true }
        ],
        tags: [
          { id: 3, name: 'animal', selected: true },
          { id: 4, name: 'dog', selected: false },
          { id: 5, name: 'woman', selected: false }
        ]
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
        people: [
          { id: 6, name: 'Ivy Barnes', selected: true },
          { id: 7, name: 'Molly Barnes', selected: false },
          { id: 8, name: 'Dexter Barnes', selected: true }
        ],
        tags: [
          { id: 9, name: 'baby', selected: false },
          { id: 10, name: 'animal', selected: true },
          { id: 11, name: 'tree', selected: false }
        ]
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
    tags: (state, getters) => tagType => {
      const photo = getters.selectedPhoto;
      return photo && ['tags', 'people'].includes(tagType)
        ? _.cloneDeep(photo[tagType])
        : [];
    },
    tagOptions: state => tagType => {
      return ['tags', 'people'].includes(tagType)
        ? _.cloneDeep(state[tagType])
        : [];
    },
    summary(state, getters) {
      const photo = getters.selectedPhoto;
      if (!photo) return {};
      const summary = {
        Size: `${pretty_size(photo.size)} (${photo.size})`,
        Dimensions: `${photo.width} x ${photo.height}`,
        Time: new Date(photo.timestamp * 1000).toLocaleString(),
        Location: `${pretty_gps(photo.lat, photo.lng)}`,
        Camera: `${photo.brand} (${photo.model})`,
        Exposure: photo.exposure,
        ISO: photo.iso,
        Aperture: photo.aperture,
        'Focal Length': photo.focal_length
      };

      const tagList = photo.tags
        .filter(val => val.selected)
        .map(val => val.name);
      const peopleList = photo.people
        .filter(val => val.selected)
        .map(val => val.name);
      summary.Tags = `(${tagList.length}) ${tagList.join(', ')}`;
      summary.People = `(${peopleList.length}) ${peopleList.join(', ')}`;

      return summary;
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
    SET_TAG(state, payload) {
      const idx = payload.list.findIndex(val => {
        return val.name == payload.name;
      });
      if (idx == -1) {
        /* New tag, so add it */
        payload.list.unshift({
          id: `${payload.photo.file}-${payload.tagType}-${payload.name}`,
          name: payload.name,
          selected: payload.selected
        });
        if (!state[payload.tagType].includes(payload.name)) {
          state[payload.tagType].unshift(payload.name);
        }
      } else {
        /* Existing tag, so update it */
        if (payload.selected === null) {
          payload.list.splice(idx, 1);
        } else {
          payload.list[idx].selected = payload.selected ? true : false;
        }
      }
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
    setTag(context, payload) {
      const photo = context.getters.selectedPhoto;

      /* Do some hardcore validation before letting this through */
      if (
        photo &&
        payload &&
        typeof payload === 'object' &&
        payload.hasOwnProperty('tagType') &&
        payload.hasOwnProperty('name') &&
        payload.hasOwnProperty('selected') &&
        typeof payload.tagType === 'string' &&
        typeof payload.name === 'string' &&
        ['tags', 'people'].includes(payload.tagType)
      ) {
        context.commit('SET_TAG', {
          photo,
          list: photo[payload.tagType],
          tagType: payload.tagType,
          name: payload.name,
          selected: payload.selected
        });
      }
    }
  },
  strict: true
});
