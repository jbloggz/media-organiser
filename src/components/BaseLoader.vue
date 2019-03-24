<template>
  <BaseModal v-bind="$props">
    <div class="loader">
      <div></div>
      <p>Loading...</p>
    </div>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue';

export default {
  name: 'BaseLoader',
  components: { BaseModal },
  props: {
    show: {
      required: true,
      type: Boolean
    },
    background: {
      required: true,
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
div.loader {
  text-align: center;
  position: relative;
  top: 50%;
  transform: translateY(-50%);

  > div {
    display: inline-block;
    width: 75px;
    height: 75px;
    border: 10px solid #ffffff10;
    border-top: 10px solid white;
    border-radius: 50%;
    animation: loader 1s linear infinite;
  }
}

@keyframes loader {
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
