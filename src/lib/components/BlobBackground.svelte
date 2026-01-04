<div class="blobContainer flex items-center justify-center">
  <div class="b1"></div>
  <div class="b2"></div>
  <div class="b3"></div>
  <div class="b4"></div>
</div>

<style>
  .blobContainer {
    filter: blur(60px);
    height: 70vh;
    width: 90%;
    z-index: -1;
  }

  .b1, .b2, .b3, .b4 {
    aspect-ratio: 1/1;
    background: var(--color-primary-color);
  }

  .b1 {
    width: 500px;
    border-radius: 30% 70% 70% 30% / 30% 40% 70% 70%;
    transform-origin: center center;
    animation: moveHorizontal 50s ease infinite;
  }

  .b2 {
    width: 470px;
    border-radius: 70% 60% 40% 90% / 60% 60% 30% 20%;
    transform-origin: calc(50% - 200px);
    animation: moveVertical 60s ease infinite;
  }

  .b3 {
    width: 650px;
    border-radius: 70% 80% 70% 90% / 60% 20% 90% 80%;
    transform-origin: calc(50% + 400px);
    animation: moveHorizontal 70s reverse infinite;
  }

  .b4 {
    width: 450px;
    border-radius: 70% 90% 40% 70% / 40% 70% 20% 30%;
    transform-origin: calc(50% - 400px);
    animation: moveVertical 80s ease infinite;
  }


  @keyframes moveInCircle {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes moveVertical {
    0% {
      transform: translateY(-80%);
    }
    50% {
      transform: translateY(80%);
    }
    100% {
      transform: translateY(-80%);
    }
  }

  @keyframes moveHorizontal {
    0% {
      transform: translateX(-80%) translateY(-10%);
    }
    50% {
      transform: translateX(80%) translateY(10%);
    }
    100% {
      transform: translateX(-80%) translateY(-10%);
    }
  }
</style>