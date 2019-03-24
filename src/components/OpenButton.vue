<template>
  <div style="display: inline-block">
    <div
      id="open-button"
      class="menu-button"
      title="Open Folder"
      @click="showDialog = true"
    >
      <span class="fas fa-folder-open"></span>
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
import BaseModal from '@/components/BaseModal.vue';

export default {
  name: 'OpenButton',
  components: { BaseModal },
  data() {
    return {
      showDialog: false
    };
  }
};
</script>

<style lang="scss" scoped>
#open-button {
  margin-left: 30px;
}

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
