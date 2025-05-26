<script lang="ts">
	import smallLogo from '$lib/assets/small-logo.png';
	import { onMount } from 'svelte';
  import { updateFooterTime } from '$lib/FrontendManager';

    onMount(async () => {
      updateFooterTime();
      setInterval(updateFooterTime, 60 * 1000);
    });

</script>
<section id="wmr-logo-only" class="flex flex-grow flex-col items-center px-4 text-center" style="height: 50vh;">
  <img src={smallLogo} alt="Logo" class="h-130 w-130 object-contain" />
    <p class="text-8xl">
      <span style="color: #55565A;"><b>West Midlands</b></span><br><span style="color: #FF8201;">Railway</span>
  </p>
</section>

<footer id="wmr-footer" class="bg-gray-800 text-white h-16 flex justify-between items-center w-full fixed bottom-0 left-0 z-10" style="background-color: #55565A;">
    <!-- Left side: Bold white text with left padding -->
    <div id="wmr-footer-text" class="font-bold pl-4 text-4xl">
        
    </div>

    <!-- Right side: Image and Time -->
    <div class="flex items-center h-full">
        <img src={smallLogo} alt="Icon" class="h-full w-16 object-cover" />
        <span id="wmr-footer-time" class="h-full text-white px-6 flex items-center justify-center text-4xl font-bold leading-none" style="background-color: #FF8201;">
            
        </span>
    </div>
</footer>


