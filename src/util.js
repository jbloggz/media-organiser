/*
 * This file contains some general utility functions for use throughout the app
 */

export default {
  pretty_size(size) {
    const prefix = ['B', 'kiB', 'MiB', 'GiB', 'TiB'];

    for (let i = 0; i < prefix.length - 1; i++) {
      if (size < 1000) {
        return `${Math.round(size * 100) / 100} ${prefix[i]}`;
      }
      size /= 1024;
    }

    return `${Math.round(size * 100) / 100} ${prefix[prefix.length - 1]}`;
  },

  pretty_gps(lat, lng) {
    if (!lat || !lng) {
      return '-';
    }

    lat = Math.round(lat * 1000000) / 1000000;
    lng = Math.round(lng * 1000000) / 1000000;

    const lat_str = lat < 0 ? `${-lat}\xB0S` : `${lat}\xB0N`;
    const lng_str = lng < 0 ? `${-lng}\xB0W` : `${lng}\xB0E`;

    return `${lat_str}, ${lng_str}`;
  }
};
