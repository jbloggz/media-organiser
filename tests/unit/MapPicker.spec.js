import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import MapPicker from '@/components/MapPicker.vue';

Vue.use(Vuex);

describe('MapPicker.vue', () => {
  let store;
  let actions = {
    updateLocation: jest.fn()
  };

  /* A dummy google maps interface */
  function createDummyGoogle(clickFn, placeFn, placeInBounds) {
    return {
      maps: {
        Map: class Map {
          constructor(elem, options) {
            this.options = options;
            this.elem = elem;
            this.controls = [[]];
            this.center = { lat: -26, lng: 135 };
            this.zoom = null;
          }
          addListener(type, cback) {
            this.elem.addEventListener(type, () => {
              cback({
                latLng: {
                  toJSON() {
                    return clickFn();
                  }
                }
              });
            });
          }
          getBounds() {
            return {
              contains(loc) {
                return placeInBounds(loc);
              }
            };
          }
          setCenter(loc) {
            this.center = loc;
          }
          setZoom(zoom) {
            this.zoom = zoom;
          }
        },
        event: {
          addListenerOnce(mp, name, cback) {
            cback();
          }
        },
        places: {
          Autocomplete: class Autocomplete {
            constructor(elem) {
              this.elem = elem;
              this.fields = null;
            }
            setFields(arr) {
              this.fields = arr;
            }
            getPlace() {
              return {
                geometry: {
                  location: {
                    toJSON: () => {
                      return placeFn();
                    }
                  }
                }
              };
            }
            addListener(type, cback) {
              this.elem.addEventListener(type, cback);
            }
          }
        },
        Marker: class Marker {
          constructor() {
            this.loc = null;
            this.map = null;
          }
          setPosition(loc) {
            this.loc = loc;
          }
          setMap(m) {
            this.map = m;
          }
          getPosition() {
            return {
              toJSON: () => {
                return this.loc;
              }
            };
          }
        },
        ControlPosition: { TOP_LEFT: 0 }
      }
    };
  }

  beforeEach(() => {
    store = new Vuex.Store({ actions });
  });

  it('Mounts successfully', () => {
    window.google = createDummyGoogle(null, null, null);
    const wrapper = shallowMount(MapPicker, {
      propsData: { location: null, apiKey: '' },
      store
    });
    expect(wrapper.vm.gmap).toBeInstanceOf(window.google.maps.Map);
    expect(wrapper.vm.autocomplete).toBeInstanceOf(
      window.google.maps.places.Autocomplete
    );
    expect(wrapper.vm.marker).toBeInstanceOf(window.google.maps.Marker);
  });

  it('Mounts with a location inside the map bounds', () => {
    window.google = createDummyGoogle(null, null, jest.fn(() => true));
    const loc = { lat: -27.900943, lng: 153.033186 };
    const wrapper = shallowMount(MapPicker, {
      propsData: { location: loc, apiKey: '' },
      store
    });
    wrapper.vm.updateMap(loc);
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.gmap.center).toEqual({ lat: -26, lng: 135 });
    expect(wrapper.vm.gmap.zoom).toBeNull();
  });

  it('Mounts with a location outside the map bounds', () => {
    window.google = createDummyGoogle(null, null, jest.fn(() => false));
    const loc = { lat: -27.900943, lng: 153.033186 };
    const wrapper = shallowMount(MapPicker, {
      propsData: { location: loc, apiKey: '' },
      store
    });
    wrapper.vm.updateMap(loc);
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.gmap.center).toEqual(loc);
    expect(wrapper.vm.gmap.zoom).toBeGreaterThan(0);
  });

  it('Clicks a location', () => {
    const loc = { lat: -25, lng: 151 };
    const clickFn = jest.fn(() => loc);
    window.google = createDummyGoogle(clickFn, null, jest.fn(() => true));

    const wrapper = shallowMount(MapPicker, {
      propsData: { location: { lat: null, lng: null }, apiKey: '' },
      store
    });

    wrapper.find('#gmap').trigger('click');
    expect(clickFn).toHaveBeenCalled();
    expect(wrapper.vm.marker.loc).toBeNull();

    // Now, the location prop would change
    wrapper.setProps({ location: loc });
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.gmap.center).toEqual({ lat: -26, lng: 135 });
    expect(wrapper.vm.gmap.zoom).toBeNull();
  });

  it("Isn't allowed to click when the location is null", () => {
    const loc = { lat: -25, lng: 151 };
    const clickFn = jest.fn(() => loc);
    window.google = createDummyGoogle(clickFn, null, jest.fn(() => true));

    const wrapper = shallowMount(MapPicker, {
      propsData: { location: null, apiKey: '' },
      store
    });

    wrapper.find('#gmap').trigger('click');
    expect(clickFn).toHaveBeenCalled();
    expect(wrapper.vm.marker.loc).toBeNull();
    wrapper.setProps({ location: null });
    expect(wrapper.vm.marker.loc).toBeNull();
    expect(wrapper.vm.marker.map).toBeNull();
  });

  it('Selects a place inside the map bounds', () => {
    const loc = { lat: -25, lng: 151 };
    const placeFn = jest.fn(() => loc);
    window.google = createDummyGoogle(null, placeFn, jest.fn(() => true));

    const wrapper = shallowMount(MapPicker, {
      propsData: { location: { lat: 1, lng: 2 }, apiKey: '' },
      store
    });

    wrapper.vm.autocomplete.elem.dispatchEvent(new Event('place_changed'));
    expect(placeFn).toHaveBeenCalled();
    expect(actions.updateLocation).toHaveBeenCalled();

    // Now, the location prop would change
    wrapper.setProps({ location: loc });
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.gmap.center).toEqual({ lat: -26, lng: 135 });
    expect(wrapper.vm.gmap.zoom).toBeNull();
  });

  it('Selects a place outside the map bounds', () => {
    const loc = { lat: -25, lng: 151 };
    const placeFn = jest.fn(() => loc);
    window.google = createDummyGoogle(null, placeFn, jest.fn(() => false));

    const wrapper = shallowMount(MapPicker, {
      propsData: { location: { lat: 1, lng: 2 }, apiKey: '' },
      store
    });

    wrapper.vm.autocomplete.elem.dispatchEvent(new Event('place_changed'));
    expect(placeFn).toHaveBeenCalled();
    expect(actions.updateLocation).toHaveBeenCalled();

    // Now, the location prop would change
    wrapper.setProps({ location: loc });
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.gmap.center).toEqual(loc);
    expect(wrapper.vm.gmap.zoom).toBeGreaterThan(0);
  });

  it('Clears a marker', () => {
    const loc = { lat: -25, lng: 151 };
    const placeFn = jest.fn(() => loc);
    window.google = createDummyGoogle(null, placeFn, jest.fn(() => false));

    const wrapper = shallowMount(MapPicker, {
      propsData: { location: { lat: 1, lng: 2 }, apiKey: '' },
      store
    });

    wrapper.vm.autocomplete.elem.dispatchEvent(new Event('place_changed'));
    wrapper.setProps({ location: loc });
    expect(wrapper.vm.marker.loc).toEqual(loc);
    expect(wrapper.vm.marker.map).toBe(wrapper.vm.gmap);

    wrapper.setProps({ location: null });
    expect(wrapper.vm.marker.loc).toBeNull();
    expect(wrapper.vm.marker.map).toBeNull();
  });
});
