<template>
  <table>
    <thead>
      <tr>
        <th colspan="2">Summary</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(val, key, index) in data" :key="index">
        <td>{{ key }}</td>
        <td>{{ val }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'AttributeViewer',
  props: {
    data: {
      required: true,
      type: Object
    }
  },
  mounted() {
    Vue.nextTick(() => this.$emit('loaded'));
  }
};
</script>

<style lang="scss" scoped></style>
