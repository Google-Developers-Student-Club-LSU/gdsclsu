<div class="fixed inset-0 -z-10 bg-white overflow-hidden">
  <div class="stripes-container">
    {#each Array(12) as _, i}
      <div 
        class="stripe"
        style="
          background: linear-gradient(135deg, #f3e8ff} 0%, #e9d5ff 100%);
          left: {i * 10 - 10}%;
          animation-delay: {i * 0.2}s;
        "
      ></div>
    {/each}
  </div>
</div>

<style>
  .stripes-container {
    position: absolute;
    inset: 0;
    transform: rotate(-45deg);
    transform-origin: center;
  }
  
  .stripe {
    position: absolute;
    width: 8%;
    height: 200%;
    top: -50%;
    animation: slide-down 15s linear infinite;
  }
  
  @keyframes slide-down {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
</style>
