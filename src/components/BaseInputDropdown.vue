<template>
  <div ref="container" class="autocomplete">
    <input
      ref="input"
      class="txt-input"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      @input="inputEvent"
      @keydown.esc="closeDropdown"
      @keydown.down.prevent="dropdownMove($event, 1)"
      @keydown.up.prevent="dropdownMove($event, -1)"
      @keydown.delete="deleteKey"
      @keydown.enter="enterKey"
    />
    <div
      v-if="filteredList.length"
      ref="autocomplete"
      class="autocomplete-items"
    >
      <div
        v-for="item in filteredList"
        :key="item.name"
        :class="item.class"
        @click="emitSelection(item.name)"
      >
        {{ item.pre }}<span class="highlight">{{ item.highlight }}</span
        >{{ item.post }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseInputDropdown',
  props: {
    list: {
      required: true,
      type: Array
    },
    placeholder: {
      required: false,
      type: String,
      default: ''
    }
  },
  data() {
    return {
      filteredList: [],
      selectedItem: null,
      preventCompletion: false
    };
  },
  mounted() {
    /* Catch any clicks outside the input and close the dropdown */
    window.document.addEventListener('click', event => {
      if (event.target !== this.$refs.input) {
        this.closeDropdown();
      }
    });
  },
  methods: {
    updateFilteredList(filter) {
      let start;
      const newList = [];
      this.selectedItem = null;
      for (let i = 0; i < this.list.length; i++) {
        start = this.list[i].toLowerCase().indexOf(filter.toLowerCase());
        if (start !== -1) {
          newList.push({
            name: this.list[i],
            pre: this.list[i].substr(0, start),
            highlight: this.list[i].substr(start, filter.length),
            post: this.list[i].substr(start + filter.length),
            class: ''
          });
        }
      }

      this.filteredList = newList;
    },
    dropdownMove(event, direction) {
      if (this.filteredList.length === 0) {
        this.updateFilteredList(event.target.value);
        return;
      }

      /* Set the active option */
      if (this.selectedItem === null) {
        this.selectedItem = direction > 0 ? 0 : this.filteredList.length - 1;
      } else {
        this.filteredList[this.selectedItem].class = '';
        this.selectedItem += this.filteredList.length + direction;
        this.selectedItem %= this.filteredList.length;
      }
      this.filteredList[this.selectedItem].class = 'autocomplete-active';

      /* Scroll to option if necessary */
      const parent = this.$refs.autocomplete;
      const item = parent.childNodes[this.selectedItem];
      const top = item.offsetTop - parent.scrollTop;
      const bottom = top + item.offsetHeight;
      if (top < 0) {
        item.scrollIntoView(true);
      } else if (bottom > parent.offsetHeight) {
        item.scrollIntoView(false);
      }

      /* Update the input value to the seletected item */
      event.target.value = this.filteredList[this.selectedItem].name;
    },
    inputEvent(event) {
      /* If the input is empty, then remove all dropdown items */
      if (event.target.value === '') {
        this.filteredList = [];
        this.preventCompletion = false;
        return;
      }

      /* Update the dropdow list */
      this.updateFilteredList(event.target.value);

      /* Unless prevented, update the input to the first valid value */
      const elem = event.target;
      const start = elem.value.length;
      if (!this.preventCompletion) {
        for (let i = 0; i < this.filteredList.length; i++) {
          if (this.filteredList[i].name.startsWith(elem.value)) {
            if (elem.value !== this.filteredList[i].name) {
              elem.value = this.filteredList[i].name;
              elem.setSelectionRange(start, elem.value.length);
            }
            return;
          }
        }
      }
      this.preventCompletion = false;
    },
    deleteKey(event) {
      /* Set a flag so that the completion doesn't run */
      this.preventCompletion = event.target.value.length > 0;
    },
    emitSelection(val) {
      this.$emit('add', val);
      this.filteredList = [];
      this.$refs.input.value = '';
    },
    enterKey(event) {
      if (event.target.value.length > 0) {
        this.emitSelection(event.target.value);
      }
    },
    closeDropdown() {
      this.filteredList = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.autocomplete {
  position: relative;
  display: inline-block;
}

input {
  padding: 5px;
}

.autocomplete-items {
  color: var(--text-invert);
  text-align: left;
  border: 1px solid var(--border);
  border-bottom: none;
  border-top: none;
  z-index: 99;
  max-height: 300px;
  overflow: auto;
  position: absolute;
  top: 100%;
  width: 100%;

  div {
    padding: 5px;
    cursor: pointer;
    background-color: var(--background-invert);
    border-bottom: 1px solid var(--border);

    &.autocomplete-active,
    &:hover {
      background-color: var(--hover);
    }
  }
}
</style>
