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

<style lang="scss" scoped>
table {
  border-collapse: collapse;

  th {
    text-align: left;
    border-bottom: solid 1px;
  }
  td {
    padding: 2px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 330px;

    &:first-child {
      border-right: solid 1px;
    }
  }
}
</style>
