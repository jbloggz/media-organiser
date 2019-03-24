<template>
  <div style="display: inline-block">
    <div
      v-if="selectedPhoto"
      id="save-button"
      class="menu-button"
      title="Save Photo"
      @click="showDialog = true"
    >
      <span class="fas fa-save"></span>
    </div>
    <BaseModal :show="showDialog">
      <div class="modal-content">
        <span class="close" @click.stop="showDialog = false">&times;</span>
        <p>Some text in the Modal..</p>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BaseModal from '@/components/BaseModal.vue';

export default {
  name: 'SaveButton',
  components: { BaseModal },
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
    ...mapGetters(['selectedPhoto'])
  }
};
</script>

<style lang="scss" scoped>
/* Modal Content/Box */
.modal-content {
  background-color: var(--background-invert);
  color: var(--text-invert);
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid var(--border);
  width: 80%;
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
