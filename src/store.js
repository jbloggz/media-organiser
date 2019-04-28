import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import util from '@/util.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    index: null,
    photos: [],
    tags: {},
    people: {},
    sessionTags: {},
    sessionPeople: {},
    tzShift: localStorage.tzShift === '0' ? 0 : parseInt(localStorage.tzShift),
    tzCache: null,
    snack: null
  },
  getters: {
    getFiles(state) {
      return _.map(state.photos, 'file');
    },
    getSnack(state) {
      return state.snack;
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
    getTimezone(state, getters) {
      const photo = getters.getPhoto;
      return photo ? photo.timezone : null;
    },
    getTags: (state, getters) => type => {
      const photo = getters.getPhoto;
      return photo && ['tags', 'people'].includes(type)
        ? _.cloneDeep(photo[type])
        : [];
    },
    getTagOptions: state => type => {
      if (!['tags', 'people'].includes(type)) {
        return [];
      }

      const arr = _.map(state[type], (val, key) => ({ key, value: val }));
      arr.sort((a, b) => b.value - a.value);

      return arr.map(v => v.key);
    },
    getSuggestedTags: (state, getters) => type => {
      const photo = getters.getPhoto;
      if (!photo || (type !== 'tags' && type !== 'people')) {
        return [];
      }

      /*
       * For tags, get the following:
       *   - Top 3 session tags
       *   - Top 3 oveall tags
       *   - All scanned tags
       *
       * For people, get the following:
       *   - Top 10 session people
       *   - Top 10 oveall people
       */

      const options = getters.getTagOptions(type);
      let suggested = _.map(
        state[`session${_.capitalize(type)}`],
        (val, key) => ({ key, value: val })
      );
      suggested.sort((a, b) => b.value - a.value);
      suggested = suggested.map(v => v.key);

      if (type === 'tags') {
        suggested.splice(5);
        for (const val of options) {
          if (!suggested.includes(val)) {
            suggested.push(val);
            if (suggested.length === 10) {
              break;
            }
          }
        }

        if (photo.scannedTags === null) {
          return photo.processingScannedTags ? null : undefined;
        } else {
          for (const val of photo.scannedTags) {
            if (!suggested.includes(val)) {
              suggested.push(val);
            }
          }
        }
      } else {
        suggested.splice(10);
        for (const val of options) {
          if (!suggested.includes(val)) {
            suggested.push(val);
            if (suggested.length === 20) {
              break;
            }
          }
        }
      }

      return suggested;
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
          value: photo.timestamp * 1000
        },
        {
          title: 'Location',
          value: `${util.pretty_gps(photo.lat, photo.lng)}`
        },
        { key: 'brand', title: 'Brand', value: photo.brand },
        { key: 'model', title: 'Model', value: photo.model },
        { key: 'exposure', title: 'Exposure', value: photo.exposure },
        { key: 'iso', title: 'ISO', value: photo.iso },
        { key: 'fNumber', title: 'F Number', value: photo.fNumber },
        {
          key: 'focalLength',
          title: 'Focal Length',
          value: photo.focalLength
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
    },
    getTzCache(state) {
      return state.tzCache;
    }
  },
  mutations: {
    SET_PHOTOS(state, payload) {
      state.photos = payload.photos;
      state.tags = payload.tags;
      state.people = payload.people;
    },
    SET_INDEX(state, index) {
      state.index = index;
    },
    SET_TIMESTAMP(state, payload) {
      payload.photo.timestamp = payload.timestamp;
    },
    SET_TIMEZONE(state, payload) {
      payload.photo.tzOffset = payload.tzOffset;
      payload.photo.timezone = payload.timezone;
    },
    SET_TZ_CACHE(state, payload) {
      state.tzCache = payload;
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
    SAVE_PHOTO(state, photo) {
      /* Update tags/people */
      for (const tag of photo.tags) {
        Vue.set(
          state.tags,
          tag,
          typeof state.tags[tag] === 'undefined' ? 1 : state.tags[tag] + 1
        );
        Vue.set(
          state.sessionTags,
          tag,
          typeof state.sessionTags[tag] === 'undefined'
            ? 1
            : state.sessionTags[tag] + 1
        );
      }
      for (const tag of photo.people) {
        Vue.set(
          state.people,
          tag,
          typeof state.people[tag] === 'undefined' ? 1 : state.people[tag] + 1
        );
        Vue.set(
          state.sessionPeople,
          tag,
          typeof state.sessionPeople[tag] === 'undefined'
            ? 1
            : state.sessionPeople[tag] + 1
        );
      }

      state.photos.splice(state.index, 1);
    },
    TRASH_PHOTO(state) {
      state.photos.splice(state.index, 1);
    },
    UPDATE_TZ_SHIFT(state, shift) {
      for (const photo of state.photos) {
        photo.timestamp += state.tzShift - shift;
      }
      state.tzShift = shift;
    },
    SET_PROCESSING_TAGS(state, payload) {
      payload.photo.processingScannedTags = payload.value;
    },
    SET_SCANNED_TAGS(state, payload) {
      payload.photo.scannedTags = payload.tags;
      payload.photo.processingScannedTags = false;
    },
    SET_SNACK(state, snack) {
      state.snack = snack;
    }
  },
  actions: {
    loadPhotos(context, path) {
      return axios
        .get(`/api/loadPath?path=${path}&output=${localStorage.outputPath}`)
        .then(json => {
          if (!json.data.photos) json.data.photos = [];
          if (!json.data.tags) json.data.tags = {};
          if (!json.data.people) json.data.people = {};

          if (context.state.tzShift) {
            for (const photo of json.data.photos) {
              photo.timestamp = photo.timestamp - context.state.tzShift;
            }
          }
          context.commit('SET_PHOTOS', json.data);

          /* Trigger a photo change to get annotations */
          context.dispatch('changePhoto', 0);

          return json.data;
        })
        .catch(err => {
          throw err.response.data;
        });
    },
    changePhoto(context, index) {
      const photos = context.state.photos;
      const newPhoto = photos[index];
      context.commit('SET_INDEX', newPhoto ? index : null);
      if (!newPhoto) {
        return;
      }

      /* If the new photo doesnt have a timezone, try to get one */
      if (newPhoto && !newPhoto.timezone) {
        context.dispatch('updateTimezone');
      }

      /* Get tags for this photo and the 2 photos either side */
      for (const offset of [0, 1, -1, 2, -2]) {
        if (
          photos[index + offset] &&
          !photos[index + offset].scannedTags &&
          !photos[index + offset].processingScannedTags
        ) {
          context.dispatch('loadScannedTags', photos[index + offset]);
        }
      }
    },
    loadScannedTags(context, payload) {
      const photo = payload || context.getters.getPhoto;

      context.commit('SET_PROCESSING_TAGS', { photo, value: true });
      axios
        .get(`/api/annotate?file=${photo.file}&key=${localStorage.apiKey}`)
        .then(resp => {
          if (
            Array.isArray(resp.data.tags) &&
            resp.data.tags.every(tag => typeof tag === 'string')
          ) {
            context.commit('SET_SCANNED_TAGS', { photo, tags: resp.data.tags });
          }
        })
        .catch(() => {
          context.commit('SET_PROCESSING_TAGS', { photo, value: false });
        });
    },
    updateTimestamp(context, timestamp) {
      const photo = context.getters.getPhoto;

      if (photo && typeof timestamp === 'number') {
        context.commit('SET_TIMESTAMP', { photo, timestamp: timestamp / 1000 });
        context.dispatch('updateTimezone');
      }
    },
    updateTimezone(context) {
      const photo = context.getters.getPhoto;
      const tzCache = context.getters.getTzCache;
      if (!photo) return Promise.reject('Error: No photo selected');

      /* Only continue if the photo has a location and timestamp */
      if (!photo.lat || !photo.lng || !photo.timestamp) {
        return Promise.resolve();
      }

      /* Check if we can use the tzCache */
      if (
        tzCache &&
        Math.abs(photo.lat - tzCache.lat) < 1 &&
        Math.abs(photo.lng - tzCache.lng) < 1 &&
        Math.abs(photo.timestamp - tzCache.time) < 86400
      ) {
        context.commit('SET_TIMEZONE', {
          photo,
          timezone: tzCache.timezone,
          tzOffset: tzCache.tzOffset
        });
        return Promise.resolve();
      }

      /* Get the timezone from google */
      const url = 'https://maps.googleapis.com/maps/api/timezone/json';
      const gps = `${photo.lat},${photo.lng}`;
      const key = localStorage.apiKey;
      const time = photo.timestamp;
      return axios
        .get(`${url}?location=${gps}&timestamp=${time}&key=${key}`)
        .then(resp => {
          if (
            !resp.data.timeZoneId ||
            typeof resp.data.rawOffset !== 'number'
          ) {
            throw new Error('Error: Cannot get timezone information');
          }
          const timezone = resp.data.timeZoneId;
          let tzOffset = resp.data.rawOffset;
          if (resp.data.dstOffset) {
            tzOffset += resp.data.dstOffset;
          }
          const tzCache = {
            lat: photo.lat,
            lng: photo.lng,
            time: photo.timestamp,
            timezone,
            tzOffset
          };
          context.commit('SET_TZ_CACHE', tzCache);
          context.commit('SET_TIMEZONE', { photo, timezone, tzOffset });
        })
        .catch(err => {
          context.commit('SET_TIMEZONE', {
            photo,
            timezone: null,
            tzOffset: 0
          });
          context.commit('SET_SNACK', {
            color: 'error',
            timeout: 4000,
            msg: err.message
          });
        });
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
        context.dispatch('updateTimezone');
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
          'fNumber',
          'focalLength'
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
    updateScannedTags(context, tags) {
      const photo = context.getters.getPhoto;

      if (
        photo &&
        Array.isArray(tags) &&
        tags.every(tag => typeof tag === 'string')
      ) {
        context.commit('SET_SCANNED_TAGS', { photo, tags });
      }
    },
    savePhoto(context) {
      const photo = context.getters.getPhoto;

      if (!photo) {
        return Promise.reject('Error: No photo selected');
      }

      /* A photo must have something set for every data field */
      for (const key of Object.keys(photo)) {
        if (['people', 'processingScannedTags'].includes(key)) {
          continue;
        } else if (
          !photo[key] ||
          (Array.isArray(photo[key]) &&
            photo[key].length == 0 &&
            key !== 'scannedTags')
        ) {
          return Promise.reject(`Error: Photo is missing a value for '${key}'`);
        }
      }

      if (context.state.index !== null) {
        return axios
          .post(`/api/save`, { photo, path: localStorage.outputPath })
          .then(() => {
            context.commit('SAVE_PHOTO', photo);

            /* Trigger a photo change to get annotations */
            context.dispatch('changePhoto', context.state.index);
          })
          .catch(err => {
            throw err.response.data;
          });
      } else {
        return Promise.reject('Error: No photo selected');
      }
    },
    trashPhoto(context) {
      const photo = context.getters.getPhoto;

      if (!photo) {
        return Promise.reject('Error: No photo selected');
      }

      if (context.state.index !== null) {
        return axios
          .get(`/api/trash?file=${photo.file}&path=${localStorage.outputPath}`)
          .then(() => {
            context.commit('TRASH_PHOTO');

            /* Trigger a photo change to get annotations */
            context.dispatch('changePhoto', context.state.index);
          });
      } else {
        return Promise.reject('Error: No photo selected');
      }
    },
    updateTzShift(context, shift) {
      if (context.state.tzShift !== shift) {
        context.commit('UPDATE_TZ_SHIFT', shift);
      }
    }
  },
  strict: process.env.NODE_ENV !== 'production'
});
