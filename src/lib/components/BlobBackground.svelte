<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  let blob1: HTMLDivElement | undefined;
  let blob2: HTMLDivElement | undefined;
  let blob3: HTMLDivElement | undefined;
  let blob4: HTMLDivElement | undefined;

  interface BlobConfig {
    element: HTMLDivElement;
    duration: number;
    xRange: number;
    yRange: number;
    delay?: number;
  }

  function animateBlob(config: BlobConfig): void {
    const { element, duration, xRange, yRange, delay = 0 } = config;
    
    const startX = gsap.utils.random(-xRange, xRange);
    const startY = gsap.utils.random(-yRange, yRange);
    
    gsap.set(element, {
      x: startX,
      y: startY
    });

    function createRandomMovement(): void {
      const targetX = gsap.utils.random(-xRange, xRange);
      const targetY = gsap.utils.random(-yRange, yRange);
      const randomDuration = gsap.utils.random(duration * 0.8, duration * 1.2);

      gsap.to(element, {
        x: targetX,
        y: targetY,
        duration: randomDuration,
        ease: 'power1.inOut',
        onComplete: createRandomMovement
      });
    }

    gsap.delayedCall(delay, createRandomMovement);
  }

  function animateBlobShape(element: HTMLDivElement, duration: number): void {
    function generateRandomBorderRadius(): string {
      const topLeft = gsap.utils.random(20, 80);
      const topRight = gsap.utils.random(20, 80);
      const bottomRight = gsap.utils.random(20, 80);
      const bottomLeft = gsap.utils.random(20, 80);
      const slashTopLeft = gsap.utils.random(20, 80);
      const slashTopRight = gsap.utils.random(20, 80);
      const slashBottomRight = gsap.utils.random(20, 80);
      const slashBottomLeft = gsap.utils.random(20, 80);
      
      return `${topLeft}% ${topRight}% ${bottomRight}% ${bottomLeft}% / ${slashTopLeft}% ${slashTopRight}% ${slashBottomRight}% ${slashBottomLeft}%`;
    }

    function morphShape(): void {
      const randomBorderRadius = generateRandomBorderRadius();
      const randomDuration = gsap.utils.random(duration * 0.5, duration * 1.5);

      gsap.to(element, {
        borderRadius: randomBorderRadius,
        duration: randomDuration,
        ease: 'power1.inOut',
        onComplete: morphShape
      });
    }

    morphShape();
  }

  onMount(() => {
    if (!blob1 || !blob2 || !blob3 || !blob4) return;

    animateBlob({
      element: blob1,
      duration: 6,
      xRange: 300,
      yRange: 250,
      delay: 0
    });

    animateBlob({
      element: blob2,
      duration: 7,
      xRange: 280,
      yRange: 300,
      delay: 0.5
    });

    animateBlob({
      element: blob3,
      duration: 8,
      xRange: 350,
      yRange: 280,
      delay: 1
    });

    animateBlob({
      element: blob4,
      duration: 6.5,
      xRange: 320,
      yRange: 260,
      delay: 0.75
    });

    animateBlobShape(blob1, 4.5);
    animateBlobShape(blob2, 5);
    animateBlobShape(blob3, 5.5);
    animateBlobShape(blob4, 4.75);
  });
</script>

<div class="blobContainer flex items-center justify-center max-w-screen">
  <div bind:this={blob1} class="blob b1"></div>
  <div bind:this={blob2} class="blob b2"></div>
  <div bind:this={blob3} class="blob b3"></div>
  <div bind:this={blob4} class="blob b4"></div>
</div>

<style>
  .blobContainer {
    filter: blur(60px);
    height: 70vh;
    width: 100%;
    z-index: -1;
    position: relative;
  }

  .blob {
    position: absolute;
    aspect-ratio: 1/1;
    background: var(--color-primary-color);
    transform-origin: center center;
  }

  .b1 {
    width: 500px;
    border-radius: 30% 70% 70% 30% / 30% 40% 70% 70%;
    left: 30%;
    top: 40%;
    transform: translate(-50%, -50%);
  }

  .b2 {
    width: 470px;
    border-radius: 70% 60% 40% 90% / 60% 60% 30% 20%;
    left: 70%;
    top: 60%;
    transform: translate(-50%, -50%);
  }

  .b3 {
    width: 650px;
    border-radius: 70% 80% 70% 90% / 60% 20% 90% 80%;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
  }

  .b4 {
    width: 450px;
    border-radius: 70% 90% 40% 70% / 40% 70% 20% 30%;
    left: 20%;
    top: 70%;
    transform: translate(-50%, -50%);
  }
</style>
