<template>
  <div style="display: inline-block">
    <div
      id="settings-button"
      class="menu-button"
      title="Settings"
      @click="showDialog = true"
    >
      <span class="fas fa-sliders-h"></span>
    </div>
    <BaseModal :show="showDialog">
      <div class="modal-content">
        <span class="close" @click.stop="showDialog = false">&times;</span>
        <h2>Settings</h2>
        <p>WARNING: Changing the API key will cause the app to reload</p>
        <table>
          <tbody>
            <tr>
              <td>Google API Key</td>
              <td><input v-model="apiKey" type="text" /></td>
            </tr>
            <tr>
              <td>Theme</td>
              <td>
                <select v-model="theme" @change="$emit('themeChanged', theme)">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="btn-container">
          <button @click="save">Save</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue';

export default {
  name: 'SettingsButton',
  components: { BaseModal },
  data() {
    return {
      showDialog: false,
      apiKey: '',
      theme: 'dark'
    };
  },
  mounted() {
    if (localStorage.apiKey) {
      this.apiKey = localStorage.apiKey;
    }
    if (localStorage.theme) {
      this.theme = localStorage.theme;
    }
  },
  methods: {
    save() {
      const reload = localStorage.apiKey !== this.apiKey;
      localStorage.apiKey = this.apiKey;
      localStorage.theme = this.theme;

      if (reload) location.reload();
      else this.showDialog = false;
    }
  }
};
</script>

<style lang="scss" scoped>
#settings-button {
  position: absolute;
  right: 30px;
  top: 0;
}

/* Modal Content/Box */
.modal-content {
  background-color: var(--background-invert);
  color: var(--text-invert);
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid var(--border);
  width: 500px;
  white-space: nowrap;
}

.btn-container {
  width: 100%;
  text-align: right;

  button {
    display: inline-block;
  }
}

td {
  padding: 10px;
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
