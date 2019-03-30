<template>
  <v-data-table hide-actions hide-headers :items="items">
    <template v-slot:items="props">
      <td>{{ props.item[0] }}</td>
      <td>{{ props.item[1] }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'AttributeViewer',
  props: {
    data: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      headers: [{ text: 'Summary', sortable: false }, { sortable: false }]
    };
  },
  computed: {
    items() {
      return Object.keys(this.data).map(key => [key, this.data[key]]);
    }
  }
};
</script>

<style lang="scss" scoped>
table.v-table tbody td {
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  padding-right: 0px;
}
</style>
