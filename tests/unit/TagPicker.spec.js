import Vue from 'vue';
import Vuex from 'vuex';
import { mount, shallowMount } from '@vue/test-utils';
import TagPicker from '@/components/TagPicker.vue';

Vue.use(Vuex);

describe('TagPicker.vue', () => {
  let store;
  let mockTagOptions = jest.fn().mockReturnValue([]);
  let actions = {
    setTag: jest.fn()
  };
  let getters = {
    tagOptions: () => mockTagOptions
  };
  let tags = [
    { id: 9, name: 'baby', selected: false },
    { id: 10, name: 'animal', selected: true },
    { id: 11, name: 'tree', selected: false }
  ];

  beforeEach(() => {
    mockTagOptions.mockClear();
    store = new Vuex.Store({ getters, actions });
  });

  it('Mounts successfully', () => {
    const wrapper = shallowMount(TagPicker, {
      propsData: {
        tagType: 'tags',
        tagList: []
      },
      store
    });
    expect(wrapper.findAll('div').length).toBe(2);
    expect(mockTagOptions.mock.calls.length).toBe(1);
  });

  it('Displays the correct tags', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        tagType: 'tags',
        tagList: tags
      },
      store
    });
    expect(wrapper.findAll('div.base-tag').length).toBe(3);
    expect(wrapper.findAll('input').length).toBe(1);
    expect(mockTagOptions.mock.calls.length).toBe(1);
  });

  it('Adds a tag', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        tagType: 'tags',
        tagList: tags
      },
      store
    });
    expect(wrapper.findAll('div.base-tag').length).toBe(3);
    expect(wrapper.findAll('input').length).toBe(1);
    expect(mockTagOptions.mock.calls.length).toBe(1);

    wrapper.setProps({
      tagList: [{ id: 123, name: 'test', selected: true }, ...tags]
    });
    expect(wrapper.findAll('div.base-tag').length).toBe(4);
    expect(mockTagOptions.mock.calls.length).toBe(3);
  });

  it('Clears all tags', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        tagType: 'tags',
        tagList: tags
      },
      store
    });
    expect(wrapper.findAll('div.base-tag').length).toBe(3);
    expect(wrapper.findAll('input').length).toBe(1);
    expect(mockTagOptions.mock.calls.length).toBe(1);

    wrapper.setProps({ tagList: [] });
    expect(wrapper.findAll('div.base-tag').length).toBe(0);
    expect(mockTagOptions.mock.calls.length).toBe(3);
  });

  it('Changes tag set', () => {
    const wrapper = mount(TagPicker, {
      propsData: {
        tagType: 'tags',
        tagList: tags
      },
      store
    });
    expect(wrapper.findAll('div.base-tag').length).toBe(3);
    expect(wrapper.findAll('input').length).toBe(1);
    expect(mockTagOptions.mock.calls.length).toBe(1);

    wrapper.setProps({ tagList: [{ id: 456, name: 'test', selected: false }] });
    expect(wrapper.findAll('div.base-tag').length).toBe(1);
    expect(mockTagOptions.mock.calls.length).toBe(3);
  });
});
