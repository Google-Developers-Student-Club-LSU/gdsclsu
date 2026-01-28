
<script lang="ts">
  import { onMount } from "svelte";

  import Lillian from "$lib/assets/Lillian.png";
  import Malik from "$lib/assets/Malik.jpg";
  import Thomas from "$lib/assets/Thomas.jpeg";
  import Quentin from "$lib/assets/Quentin.jpg";
  

  onMount(() => {
    const track = document.getElementById("track");

    const handleOnDown = e => track.dataset.mouseDownAt = e.clientX;

    const handleOnUp = () => {
      track.dataset.mouseDownAt = "0";  
      track.dataset.prevPercentage = track.dataset.percentage;
    }

    const handleOnMove = e => {
      if(track.dataset.mouseDownAt === "0") return;
      
      const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
            maxDelta = window.innerWidth / 2;
      
      const percentage = (mouseDelta / maxDelta) * -100,
            nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage,
            nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
      
      track.dataset.percentage = nextPercentage;
      
      track.animate({
        transform: `translateX(${nextPercentage}%)`
      }, { duration: 1200, fill: "forwards" });
      
      for(const image of track.getElementsByClassName("image")) {
        image.animate({
          objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
      }
    }

    window.onmousedown = e => handleOnDown(e);
    window.ontouchstart = e => handleOnDown(e.touches[0]);
    window.onmouseup = e => handleOnUp(e);
    window.ontouchend = e => handleOnUp(e.touches[0]);
    window.onmousemove = e => handleOnMove(e);
    window.ontouchmove = e => handleOnMove(e.touches[0]);
  }) 
</script>

<div id="track" data-mouse-down-at="0" data-prev-percentage="0" data-percentage="0" class="flex justify-center align-center">
  <img src={Lillian} alt="Lillian" class="image"/>
  <img src={Malik} alt="Malik" class="image"/>
  <img src={Quentin} alt="Quentin" class="image"/>
  <img src={Thomas} alt="Thomas" class="image"/>
</div>

<style>
  #track > .image {
    width: 50vmin;
    height: 56vmin;
    object-fit: cover;
    object-position: 100% center;
  }

  #track {
    width: 40vh;
    display: flex;
    gap: 4vmin;
    user-select: none;
  }
</style>