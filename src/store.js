import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import util from '@/util.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    index: null,
    media: [],
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
      return _.map(state.media, 'file');
    },
    getSnack(state) {
      return state.snack;
    },
    getCurrent(state) {
      return state.index !== null && state.index < state.media.length
        ? state.media[state.index]
        : null;
    },
    getLocation(state, getters) {
      const item = getters.getCurrent;
      return item
        ? {
            lat: item.lat,
            lng: item.lng
          }
        : null;
    },
    getTimezone(state, getters) {
      const item = getters.getCurrent;
      return item ? item.timezone : null;
    },
    getTags: (state, getters) => type => {
      const item = getters.getCurrent;
      return item && ['tags', 'people'].includes(type)
        ? _.cloneDeep(item[type])
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
      const item = getters.getCurrent;
      if (!item || (type !== 'tags' && type !== 'people')) {
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

        if (item.scannedTags === null) {
          return item.processingScannedTags ? null : undefined;
        } else {
          for (const val of item.scannedTags) {
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
      const item = getters.getCurrent;
      if (!item) return [];

      return [
        {
          title: 'Type',
          value: item.type
        },
        {
          title: 'Size',
          value: `${util.pretty_size(item.size)} (${item.size})`
        },
        {
          title: 'Length',
          value: item.length
        },
        {
          title: 'Dimensions',
          value: `${item.width} x ${item.height}`
        },
        {
          key: 'timestamp',
          title: 'Time',
          value: item.timestamp * 1000
        },
        {
          title: 'Location',
          value: `${util.pretty_gps(item.lat, item.lng)}`
        },
        { key: 'camera', title: 'Camera', value: item.camera },
        {
          title: 'Tags',
          value: `(${item.tags.length}) ${item.tags.join(', ')}`
        },
        {
          title: 'People',
          value: `(${item.people.length}) ${item.people.join(', ')}`
        }
      ];
    },
    getTzCache(state) {
      return state.tzCache;
    }
  },
  mutations: {
    SET_MEDIA(state, payload) {
      state.media = payload.media;
      state.tags = payload.tags;
      state.people = payload.people;
    },
    SET_INDEX(state, index) {
      state.index = index;
    },
    SET_TIMESTAMP(state, payload) {
      payload.item.timestamp = payload.timestamp;
    },
    SET_TIMEZONE(state, payload) {
      payload.item.tzOffset = payload.tzOffset;
      payload.item.timezone = payload.timezone;
    },
    SET_TZ_CACHE(state, payload) {
      state.tzCache = payload;
    },
    SET_LOCATION(state, payload) {
      payload.item.lat = payload.lat;
      payload.item.lng = payload.lng;
    },
    SET_TEXT_VALUE(state, payload) {
      payload.item[payload.key] = payload.value;
    },
    SET_TAGS(state, payload) {
      payload.item[payload.type] = payload.list.sort();
    },
    SAVE_CURRENT(state, item) {
      /* Update tags/people */
      for (const tag of item.tags) {
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
      for (const tag of item.people) {
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

      state.media.splice(state.index, 1);
    },
    TRASH_CURRENT(state) {
      state.media.splice(state.index, 1);
    },
    UPDATE_TZ_SHIFT(state, shift) {
      for (const item of state.media) {
        item.timestamp += state.tzShift - shift;
      }
      state.tzShift = shift;
    },
    SET_PROCESSING_TAGS(state, payload) {
      payload.item.processingScannedTags = payload.value;
    },
    SET_SCANNED_TAGS(state, payload) {
      payload.item.scannedTags = payload.tags;
      payload.item.processingScannedTags = false;
    },
    SET_SNACK(state, snack) {
      state.snack = snack;
    }
  },
  actions: {
    loadMedia(context, path) {
      return axios
        .get(`/api/loadPath?path=${path}&output=${localStorage.outputPath}`)
        .then(json => {
          if (!json.data.media) json.data.media = [];
          if (!json.data.tags) json.data.tags = {};
          if (!json.data.people) json.data.people = {};

          if (context.state.tzShift) {
            for (const item of json.data.media) {
              item.timestamp = item.timestamp - context.state.tzShift;
            }
          }
          context.commit('SET_MEDIA', json.data);

          /* Trigger an item change to get annotations */
          context.dispatch('changeItem', 0);

          return json.data;
        })
        .catch(err => {
          throw err.response.data;
        });
    },
    changeItem(context, index) {
      const media = context.state.media;
      const newItem = media[index];
      context.commit('SET_INDEX', newItem ? index : null);
      if (!newItem) {
        return;
      }

      /* If the new item doesnt have a timezone, try to get one */
      if (newItem && !newItem.timezone) {
        context.dispatch('updateTimezone');
      }

      /* Get tags for this item and the 2 items either side */
      for (const offset of [0, 1, -1, 2, -2]) {
        if (
          media[index + offset] &&
          !media[index + offset].scannedTags &&
          !media[index + offset].processingScannedTags
        ) {
          context.dispatch('loadScannedTags', media[index + offset]);
        }
      }
    },
    loadScannedTags(context, payload) {
      const item = payload || context.getters.getCurrent;

      context.commit('SET_PROCESSING_TAGS', { item, value: true });
      axios
        .get(`/api/annotate?file=${item.file}&key=${localStorage.apiKey}`)
        .then(resp => {
          if (
            Array.isArray(resp.data.tags) &&
            resp.data.tags.every(tag => typeof tag === 'string')
          ) {
            context.commit('SET_SCANNED_TAGS', { item, tags: resp.data.tags });
          }
        })
        .catch(() => {
          context.commit('SET_PROCESSING_TAGS', { item, value: false });
        });
    },
    updateTimestamp(context, timestamp) {
      const item = context.getters.getCurrent;

      if (item && typeof timestamp === 'number') {
        context.commit('SET_TIMESTAMP', { item, timestamp: timestamp / 1000 });
        context.dispatch('updateTimezone');
      }
    },
    updateTimezone(context) {
      const item = context.getters.getCurrent;
      const tzCache = context.getters.getTzCache;
      if (!item) return Promise.reject('Error: No item selected');

      /* Only continue if the item has a location and timestamp */
      if (!item.lat || !item.lng || !item.timestamp) {
        return Promise.resolve();
      }

      /* Check if we can use the tzCache */
      if (
        tzCache &&
        Math.abs(item.lat - tzCache.lat) < 1 &&
        Math.abs(item.lng - tzCache.lng) < 1 &&
        Math.abs(item.timestamp - tzCache.time) < 86400
      ) {
        context.commit('SET_TIMEZONE', {
          item,
          timezone: tzCache.timezone,
          tzOffset: tzCache.tzOffset
        });
        return Promise.resolve();
      }

      /* Get the timezone from google */
      const url = 'https://maps.googleapis.com/maps/api/timezone/json';
      const gps = `${item.lat},${item.lng}`;
      const key = localStorage.apiKey;
      const time = item.timestamp;
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
            lat: item.lat,
            lng: item.lng,
            time: item.timestamp,
            timezone,
            tzOffset
          };
          context.commit('SET_TZ_CACHE', tzCache);
          context.commit('SET_TIMEZONE', { item, timezone, tzOffset });
        })
        .catch(err => {
          context.commit('SET_TIMEZONE', {
            item,
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
      const item = context.getters.getCurrent;
      if (!item) return;

      /* Do some hardcore validation before letting this through */
      if (
        item &&
        loc &&
        typeof loc === 'object' &&
        loc.hasOwnProperty('lat') &&
        typeof loc.lat === 'number' &&
        loc.hasOwnProperty('lng') &&
        typeof loc.lng === 'number'
      ) {
        context.commit('SET_LOCATION', { item, ...loc });
        context.dispatch('updateTimezone');
      }
    },
    updateTextValue(context, payload) {
      const item = context.getters.getCurrent;

      /* Currently only 'camera' is valid */
      if (
        item &&
        ['camera'].includes(payload.key) &&
        typeof payload.value === 'string'
      ) {
        context.commit('SET_TEXT_VALUE', {
          item,
          key: payload.key,
          value: payload.value
        });
      }
    },
    updateTags(context, payload) {
      const item = context.getters.getCurrent;

      /* Do some hardcore validation before letting this through */
      if (
        item &&
        payload.hasOwnProperty('type') &&
        typeof payload.type === 'string' &&
        ['tags', 'people'].includes(payload.type) &&
        payload.hasOwnProperty('list') &&
        Array.isArray(payload.list) &&
        payload.list.every(tag => typeof tag === 'string')
      ) {
        context.commit('SET_TAGS', {
          item,
          type: payload.type,
          list: payload.list
        });
      }
    },
    updateScannedTags(context, tags) {
      const item = context.getters.getCurrent;

      if (
        item &&
        Array.isArray(tags) &&
        tags.every(tag => typeof tag === 'string')
      ) {
        context.commit('SET_SCANNED_TAGS', { item, tags });
      }
    },
    saveCurrent(context) {
      const item = context.getters.getCurrent;

      if (!item) {
        return Promise.reject('Error: No item selected');
      }

      if (context.state.index !== null) {
        return axios
          .post(`/api/save`, { item, path: localStorage.outputPath })
          .then(() => {
            context.commit('SAVE_CURRENT', item);

            /* Trigger an item change to get annotations */
            context.dispatch('changeItem', context.state.index);
          })
          .catch(err => {
            throw err.response.data;
          });
      } else {
        return Promise.reject('Error: No item selected');
      }
    },
    trashCurrent(context) {
      const item = context.getters.getCurrent;

      if (!item) {
        return Promise.reject('Error: No item selected');
      }

      if (context.state.index !== null) {
        return axios
          .get(`/api/trash?file=${item.file}&path=${localStorage.outputPath}`)
          .then(() => {
            context.commit('TRASH_CURRENT');

            /* Trigger a item change to get annotations */
            context.dispatch('changeItem', context.state.index);
          });
      } else {
        return Promise.reject('Error: No item selected');
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
