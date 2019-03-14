import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import PhotoViewer from '@/components/PhotoViewer.vue';

Vue.use(Vuex);

describe('PhotoViewer.vue', () => {
  let store;
  let mockPhotos = jest.fn().mockReturnValue([
    {
      file: './assets/test1.jpg',
      size: 8885509,
      width: 6000,
      height: 4000,
      timestamp: 1551152937,
      lat: -29.6687,
      lng: 153.109,
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
      file: './assets/test2.jpg',
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
      file: './assets/test3.jpg',
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
  ]);
  let mockSelectedPhoto = jest.fn();
  let mockSetPhoto = jest.fn();
  let actions = {
    setPhoto: mockSetPhoto
  };
  let getters = {
    photos: mockPhotos,
    selectedPhoto: mockSelectedPhoto
  };

  beforeEach(() => {
    mockPhotos.mockClear();
    mockSetPhoto.mockReset();
    mockSelectedPhoto.mockReset();
    store = new Vuex.Store({ getters, actions });
  });

  it('Mounts successfully', () => {
    const wrapper = shallowMount(PhotoViewer, { store });
    expect(mockPhotos.mock.calls.length).toBe(1);
    expect(wrapper.findAll('div.photo-list img').length).toBe(3);
    expect(wrapper.findAll('div.selected-photo img').length).toBe(0);
  });

  it('Selects a photo', () => {
    const wrapper = shallowMount(PhotoViewer, { store });
    expect(mockPhotos.mock.calls.length).toBe(1);
    expect(mockSelectedPhoto.mock.calls.length).toBe(1);
    expect(wrapper.findAll('div.photo-list img').length).toBe(3);

    const img = wrapper.findAll('div.photo-list img').at(1);
    mockSelectedPhoto.mockReturnValue({ file: mockPhotos()[1].file });
    img.trigger('click');
    expect(mockSetPhoto.mock.calls.length).toBe(1);
  });

  it('Has a selected photo', () => {
    mockSelectedPhoto.mockReturnValue({ file: mockPhotos()[1].file });
    const wrapper = shallowMount(PhotoViewer, { store });
    expect(mockPhotos.mock.calls.length).toBe(2);
    expect(mockSelectedPhoto.mock.calls.length).toBe(1);
    expect(wrapper.findAll('div.selected-photo img').length).toBe(1);
    expect(wrapper.find('div.selected-photo img').attributes('src')).toBe(
      mockPhotos()[1].file
    );
  });
});
