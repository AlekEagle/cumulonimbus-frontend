<template>
  <span class="animated-ellipsis">
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </span>
</template>

<style>
  .animated-ellipsis span {
    opacity: 0;
    animation: ellipsis-animation 1s infinite;
    -webkit-animation: ellipsis-animation 1s infinite;
  }

  .animated-ellipsis span:nth-child(2) {
    animation-delay: 0.1s;
    -webkit-animation-delay: 0.1s;
  }

  .animated-ellipsis span:nth-child(3) {
    animation-delay: 0.2s;
    -webkit-animation-delay: 0.2s;
  }

  @keyframes ellipsis-animation {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @-webkit-keyframes ellipsis-animation {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
