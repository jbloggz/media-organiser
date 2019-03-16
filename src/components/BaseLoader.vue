<template>
  <div class="loader">
    <div>
      <div></div>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseLoader'
};
</script>

<style lang="scss" scoped>
div.loader {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  background: var(--background);
  text-align: center;

  &.hidden {
    display: none;
  }

  > div {
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
}
</style>
