import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import PhotoViewer from '@/components/PhotoViewer.vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);
Vue.use(Vuex);

describe('PhotoViewer.vue', () => {
  let store;
  let mockPhotos = jest.fn().mockReturnValue([
    {
      file: './assets/test1.jpg'
    },
    {
      file: './assets/test2.jpg'
    },
    {
      file: './assets/test3.jpg'
    }
  ]);
  let mockSetPhoto = jest.fn();
  let actions = {
    setPhoto: mockSetPhoto
  };
  let getters = {
    photos: mockPhotos
  };

  beforeEach(() => {
    mockPhotos.mockClear();
    mockSetPhoto.mockReset();
    store = new Vuex.Store({ getters, actions });
  });

  it('Mounts successfully', () => {
    const wrapper = shallowMount(PhotoViewer, { store });
    expect(wrapper.vm.photos.length).toBe(3);
  });
});
