<template>
  <v-menu
    :close-on-content-click="false"
    :nudge-right="40"
    lazy
    transition="scale-transition"
    full-width
    top
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <span class="dt-activator" v-on="on">
        <v-icon small class="pr-2">
          mdi-square-edit-outline
        </v-icon>
        {{ displayText }}
      </span>
    </template>
    <v-date-picker
      v-model="dateString"
      color="primary"
      @input="input"
    ></v-date-picker>
    <v-time-picker
      v-model="timeString"
      color="primary"
      @input="input"
    ></v-time-picker>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DatetimePicker',
  props: {
    timestamp: {
      required: true,
      type: Number
    },
    timezone: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      dateString: new Date(this.timestamp).toISOString().substr(0, 10),
      timeString: new Date(this.timestamp).toTimeString().substr(0, 8)
    };
  },
  computed: {
    ...mapGetters(['getTzOffset']),
    displayText() {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      if (this.timezone) {
        options.timeZone = this.timezone;
      }
      return new Date(this.timestamp).toLocaleString('en-AU', options);
    }
  },
  methods: {
    input() {
      const itemOffset = this.getTzOffset;
      const localOffset = new Date().getTimezoneOffset() * -60;
      let shift = localOffset - itemOffset;
      if (itemOffset === null) {
        shift = 0;
      }

      this.$emit(
        'change',
        Date.parse(`${this.dateString} ${this.timeString}`) + shift * 1000
      );
    }
  }
};
</script>

<style lang="scss">
.v-time-picker-title__time .v-picker__title__btn,
.v-time-picker-title__time span {
  height: 56px;
  font-size: 50px;
}

.v-date-picker-table {
  height: 246px;
}

.dt-activator {
  cursor: pointer;
}
</style>
