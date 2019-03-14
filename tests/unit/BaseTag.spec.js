import { shallowMount } from '@vue/test-utils';
import BaseTag from '@/components/BaseTag.vue';

describe('BaseTag.vue', () => {
  it('Mounts successfully', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: true
        }
      }
    });
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('Creates tag with correct text', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: true
        }
      }
    });
    expect(wrapper.find('div').text()).toBe('test');
  });

  it('Creates selected tag', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: true
        }
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(true);
  });

  it('Creates non selected tag', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: false
        }
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(false);
  });

  it('Deselects tag', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: true
        }
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(true);
    wrapper.setProps({
      tag: {
        name: 'test',
        selected: false
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(false);
  });

  it('Selects tag', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: false
        }
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(false);
    wrapper.setProps({
      tag: {
        name: 'test',
        selected: true
      }
    });
    expect(wrapper.find('div').classes('selected')).toBe(true);
  });

  it('Changes tag name', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: false
        }
      }
    });
    expect(wrapper.find('div').text()).toBe('test');
    wrapper.setProps({
      tag: {
        name: 'newText',
        selected: false
      }
    });
    expect(wrapper.find('div').text()).toBe('newText');
  });

  it('Changes tag name and selected status', () => {
    const wrapper = shallowMount(BaseTag, {
      propsData: {
        tag: {
          name: 'test',
          selected: false
        }
      }
    });
    expect(wrapper.find('div').text()).toBe('test');
    expect(wrapper.find('div').classes('selected')).toBe(false);
    wrapper.setProps({
      tag: {
        name: 'newText',
        selected: true
      }
    });
    expect(wrapper.find('div').text()).toBe('newText');
    expect(wrapper.find('div').classes('selected')).toBe(true);
  });

});
