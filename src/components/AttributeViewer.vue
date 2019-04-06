<template>
  <div class="summary">
    <v-data-table hide-actions hide-headers :items="data">
      <template v-slot:items="{ item }">
        <td>{{ item.title }}</td>
        <td class="pl-2">
          <span v-if="typeof item.key === 'undefined'">
            <v-icon style="visibility: hidden;" small class="pr-2">
              mdi-square-edit-outline
            </v-icon>
            {{ item.value }}
          </span>
          <DatetimePicker
            v-else-if="item.key === 'timestamp'"
            :timestamp="item.value"
            @change="updateTimestamp"
          />
          <v-edit-dialog
            v-else
            :return-value="item.value"
            @save="updateTextValue({ key: item.key, value: edit[item.key] })"
            @open="edit[item.key] = item.value"
          >
            <v-icon small class="pr-2">
              mdi-square-edit-outline
            </v-icon>
            {{ item.value }}
            <template v-slot:input>
              <v-text-field
                v-model="edit[item.key]"
                label="Edit"
                single-line
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import DatetimePicker from '@/components/DatetimePicker.vue';

export default {
  name: 'AttributeViewer',
  components: {
    DatetimePicker
  },
  props: {
    data: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      edit: {
        timestamp: 0,
        brand: '',
        model: '',
        exposure: '',
        iso: '',
        aperture: '',
        focal_length: ''
      }
    };
  },
  methods: {
    ...mapActions(['updateTimestamp', 'updateTextValue'])
  }
};
</script>

<style lang="scss">
div.summary {
  table.v-table tbody td {
    height: 28px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
    padding-right: 0px;
  }

  .v-menu {
    display: inherit;
  }
}
.v-time-picker-title__time .v-picker__title__btn,
.v-time-picker-title__time span {
  height: 56px;
  font-size: 50px;
}

.v-date-picker-table {
  height: 246px;
}
</style>
