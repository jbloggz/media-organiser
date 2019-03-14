<template>
  <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
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
export default {
  name: 'AttributeViewer',
  props: {
    data: {
      required: true,
      type: Object
    }
  }
};
</script>

<style lang="scss" scoped></style>
