/*
 * This file contains some general utility functions for use throughout the app
 */

export function pretty_size(size) {
  const prefix = ['B', 'kiB', 'MiB', 'GiB', 'TiB'];

  for (let i = 0; i < prefix.length - 1; i++) {
    if (size < 1000) {
      return `${Math.round(size * 100) / 100} ${prefix[i]}`;
    }
    size /= 1024;
  }

  return `${Math.round(size * 100) / 100} ${prefix[prefix.length - 1]}`;
}
