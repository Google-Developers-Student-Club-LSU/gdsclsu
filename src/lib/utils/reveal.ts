import type { Action } from 'svelte/action';

interface RevealParams {
  delay?: number;
}

export const reveal: Action<HTMLElement, RevealParams | undefined> = (node, params) => {
  const { delay = 0 } = params ?? {};

  node.classList.add('reveal');
  node.style.transitionDelay = `${delay}ms`;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible');
        observer.unobserve(node);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
};