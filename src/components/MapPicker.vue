<template>
  <div>
    <div id="gmap"></div>
    <div v-show="loaded" id="gmap-search">
      <input type="text" placeholder="Enter a location" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';

export default {
  name: 'MapPicker',
  props: {
    location: {
      required: true,
      default() {
        return null;
      },
      validator(val) {
        return val === null || ('lat' in val && 'lng' in val);
      }
    },
    apiKey: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      gmap: null,
      autocomplete: null,
      marker: null,
      scriptCreated: false,
      loaded: false
    };
  },
  watch: {
    location(loc) {
      this.updateMap(loc);
    }
  },
  mounted() {
    /* If the google obj already exists, then don't load the script again */
    if (window.google && window.google.maps) {
      this.createMapData();
    } else {
      this.loadGoogleScript();
    }
  },
  methods: {
    ...mapActions(['updateLocation']),
    setMarker(loc) {
      this.marker.setPosition(loc);
      this.marker.setMap(this.gmap);
    },
    setPlace() {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) return;
      this.updateLocation(place.geometry.location.toJSON());
    },
    updateMap(loc) {
      /* The location changed, so update the map to the new location */
      const marker_pos = this.marker.getPosition()
        ? this.marker.getPosition().toJSON()
        : null;

      /* If the location is null, then remove the marker */
      if (loc === null) {
        this.marker.setMap(null);
        this.marker.setPosition(null);
        return;
      }

      if (loc.lat === null || loc.lng === null) {
        /* The location isn't set, so update it to the current map position */
        if (marker_pos) {
          this.updateLocation(marker_pos);
        }
      } else if (
        !marker_pos ||
        marker_pos.lat !== loc.lat ||
        marker_pos.lng !== loc.lng
      ) {
        /*
         * The location is different to the marker, so update the marker. But
         * only change the view if the marker is outside of the current view
         */
        const bounds = this.gmap.getBounds();
        if (!bounds || !bounds.contains(loc)) {
          this.gmap.setCenter(loc);
          this.gmap.setZoom(15);
        }
        this.setMarker(loc);
      }
    },
    loadGoogleScript() {
      if (this.scriptCreated) return;
      this.scriptCreated = true;

      /* Setup the callback */
      window['__MapPicker_google_cback__'] = this.createMapData;

      /* Load the google maps script */
      const script = document.createElement('script');
      const url = 'https://maps.googleapis.com/maps/api/js';
      script.type = 'text/javascript';
      script.src = `${url}?key=${
        this.apiKey
      }&libraries=places&callback=__MapPicker_google_cback__`;
      document.body.appendChild(script);
    },
    createMapData() {
      const gm = window.google.maps;

      /* Create the map (default to showing Australia) */
      this.gmap = new gm.Map(this.$el.querySelector('#gmap'), {
        center: {
          lat: -26,
          lng: 135
        },
        zoom: 4,
        controlSize: 25,
        streetViewControl: false
      });

      /* Add the search box to the map */
      this.gmap.controls[gm.ControlPosition.TOP_LEFT].push(
        this.$el.querySelector('#gmap-search')
      );

      /* Set the search box as an google autocompleter */
      this.autocomplete = new gm.places.Autocomplete(
        this.$el.querySelector('input[type=text]')
      );
      this.autocomplete.setFields(['geometry']);

      /* Create the marker object */
      this.marker = new gm.Marker();
      this.gmap.addListener('click', event => {
        this.updateLocation(event.latLng.toJSON());
      });
      this.autocomplete.addListener('place_changed', () => this.setPlace());

      /* Add listeners for when google maps have loaded */
      gm.event.addListenerOnce(this.gmap, 'tilesloaded', () => {
        this.loaded = true;
        this.updateMap(this.location);
        Vue.nextTick(() => this.$emit('loaded'));
      });
    }
  }
};
</script>

<style lang="scss">
#gmap {
  height: 350px;
}
#gmap-search > input {
  margin-top: 6px;
  padding: 4.5px;
  width: 200px;
  background: white;
  color: #303030;
  font-size: 14px;
  border: none;
  border-radius: 2px;
  box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.1);
}
</style>
