import Vue from 'vue';
import Vuex from 'vuex';
import { mount } from '@vue/test-utils';
import TagPicker from '@/components/TagPicker.vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);
Vue.use(Vuex);

describe('TagPicker.vue', () => {
  let store;
  const mockTagOptions = jest.fn().mockReturnValue([]);
  const mockSuggestedTags = jest.fn().mockReturnValue([]);

  /* Hack to keep vuetify happy because there is no v-app */
  const el = document.createElement('div');
  el.setAttribute('data-app', true);
  document.body.appendChild(el);

  beforeEach(() => {
    mockTagOptions.mockClear();
    mockSuggestedTags.mockClear();
    store = new Vuex.Store({
      state: {
        tags: ['baby', 'animal', 'tree']
      },
      getters: {
        tagOptions: () => mockTagOptions,
        tags: state => () => {
          return state.tags;
        },
        suggestedTags: () => mockSuggestedTags
      },
      actions: {
        setTag: jest.fn()
      }
    });
  });

  it('Mounts successfully', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        type: 'tags',
        icon: 'group'
      },
      store
    });
    expect(wrapper.findAll('div.tag-picker').length).toBe(1);
  });

  it('Displays the correct tags', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        type: 'tags',
        icon: 'group'
      },
      store
    });
    expect(wrapper.findAll('div.v-input__slot span.v-chip').length).toBe(3);
    expect(mockTagOptions.mock.calls.length).toBe(1);
    expect(mockSuggestedTags.mock.calls.length).toBe(1);
  });
});
