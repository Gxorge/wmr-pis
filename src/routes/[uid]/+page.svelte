<script lang="ts">
	import smallLogo from '$lib/assets/small-logo.png';
  import platformStep from '$lib/assets/platform-step.png';
  import platformPushcair from '$lib/assets/platform-pushchair.png';
	import { onMount } from 'svelte';
  import { page } from '$app/state';
  import * as fem from '$lib/FrontendManager';
  import * as bem from '$lib/BackendManager';
  import { LoopController } from '$lib/LoopController';
	import { playAudioFiles, pluraliseAudio, type AudioItem, type AudioItemObject } from '$lib/AnnouncementSystem';

  let serviceUid: string = page.params.uid;
  let nowApproaching: boolean = false;
  let welcomeTo: boolean = false;
  let currentData: RTTWhereIsTrain = {status: "", location: "", locationCode: "", for: "", forCode: "", callingAt: [], callingAtCodes: [], displayAs: ""};
  let fullCallRead: string[] = ['DDG', 'WTE', 'TYS', 'SMA', 'BMO', 'BSW', 'JEQ', 'SGB', 'SBJ', 'KID', 'DTW', 'WOS', 'WOF'];

  const inbetweenStationsLoop = new LoopController(async () => {
    fem.thisTrainIsFor(currentData.for);
    await new Promise(res => setTimeout(res, 10_000));
    if (!inbetweenStationsLoop.isRunning()) return;
    // calling at
    // connections
    // photos
    inbetweenStationsLoop.stop();
  });

  const approachingStationLoop = new LoopController(async () => {
    fem.approaching(currentData.location);
    await new Promise(res => setTimeout(res, 10_000));
    if (!approachingStationLoop.isRunning()) return;

    fem.approachingPlatformStep();
    await new Promise(res => setTimeout(res, 10_000));
    if (!approachingStationLoop.isRunning()) return;

    fem.approachingPlatformPushchair();
    await new Promise(res => setTimeout(res, 10_000));
  });

  const atStationLoop = new LoopController(async () => {
    fem.thisIs(currentData.location);
    await new Promise(res => setTimeout(res, 10_000));
    if (!atStationLoop.isRunning()) return;
    fem.thisTrainIsFor(currentData.for);
    atStationLoop.stop();
  });

  onMount(async () => {
    // debug
    (window as any).approaching = fem.approaching;
    (window as any).thisIs = fem.thisIs;
    (window as any).thisTrainIsFor = fem.thisTrainIsFor;
    (window as any).defaultToLogo = fem.defaultToLogo;

    // time
    fem.updateFooterTime();
    setInterval(fem.updateFooterTime, 60 * 1000);

    let d = await bem.getRTTData(serviceUid);
    document.getElementById('wmr-footer-text')!!.innerHTML = "This train is for " + d.destination[0].description;

    const tf: AudioItem[] = [];
    tf.push('bing bong');
    await playAudioFiles(tf, false);

    setInterval(async () => {
      let data = await bem.whereIsTrain(serviceUid);

      if (currentData.location != data.location) {
        fem.theNextStationIs(data.location);
        currentData = data;
        nowApproaching = false;
        welcomeTo = false;
      }

      console.log("status: '" + data.status + "'")

      if (data.status == "APPR_PLAT" && data.location == currentData.location && !nowApproaching) {
        inbetweenStationsLoop.stop();
        atStationLoop.stop();
        approachingStationLoop.start();
        nowApproaching = true;

        const files: AudioItem[] = [];
        files.push('bing bong');
        files.push('we are now approaching');
        files.push({ id: `stations.${data.locationCode}`, opts: { delayStart: 200 } });

        if (data.locationCode == data.forCode) {
          files.push({ id: 'our final destination', opts: { delayStart: 200 } })
        }

        if (data.locationCode == "BSW") {
          files.push({ id: 'please have your tickets ready', opts: { delayStart: 300 } })
        }

        files.push({ id: 'please mind the gap when leaving the train and step', opts: { delayStart: 500 } })
        await playAudioFiles(files, false);
        return;
      }

      if ((data.status == "AT_PLAT" && data.location == currentData.location && !welcomeTo) || (data.displayAs == "DESTINATION" && data.location == data.for && nowApproaching && !welcomeTo)) {
        if (data.status == "APPR_PLAT")
          return;

        inbetweenStationsLoop.stop();
        approachingStationLoop.stop();
        atStationLoop.start();
        welcomeTo = true;

        const files: AudioItem[] = [];
        files.push('bing bong');

        if (data.locationCode == data.forCode) {
            files.push('this is');
            files.push({ id: `stations.${data.forCode}`, opts: { delayStart: 200 } });
            files.push({ id: 'our final destination', opts: { delayStart: 200 } });
            files.push({ id: 'please mind the gap when leaving the train and step', opts: { delayStart: 500 } });
            await playAudioFiles(files, false);
            return;
        }

        files.push('welcome to this service for');
        files.push({ id: `stations.${data.forCode}`, opts: { delayStart: 200 } });

        const remainingStops = [
          ...data.callingAtCodes.map((crsCode): AudioItemObject => ({ id: `stations.${crsCode}`, opts: { delayStart: 100 } }))
        ]

        if (remainingStops.length == 1 || !fullCallRead.includes(data.locationCode)) {
          files.push({ id: `the next station is`, opts: { delayStart: 200 } });
          files.push(remainingStops[0])
        } else {
            files.push({ id: `calling at`, opts: { delayStart: 200 } });
            files.push(...pluraliseAudio(remainingStops, { beforeAndDelay: 200, beforeItemDelay: 200 }))
        }

        await playAudioFiles(files, false);
        return;
      }


      if (data.status == undefined || data.status == "APPR_STAT") {
        if (!inbetweenStationsLoop.isRunning()) {
            atStationLoop.stop();
            approachingStationLoop.stop();
            inbetweenStationsLoop.start();
        }
      }

    }, 10 * 1000)
  });
</script>

<div class="min-h-screen flex flex-col">
  <div id="wmr-double" class="flex-grow hidden items-center justify-center px-4 text-center" style="height: 50vh;">
    <div class="max-w-4xl w-full flex flex-col justify-center h-full">
      <p id="wmr-double-top" class="text-3xl text-gray-600 mb-2 leading-none" style="color: #55565A;">
        
      </p>
      <p id="wmr-double-bottom" class="text-8xl font-extrabold text-gray-900 leading-none" style="color: #FF8201;">
        
      </p>
    </div>
  </div>

  <section id="wmr-logo-only" class="flex flex-grow flex-col items-center px-4 text-center" style="height: 50vh;">
    <img src={smallLogo} alt="Logo" class="h-130 w-130 object-contain" />
      <p class="text-8xl">
        <span style="color: #55565A;"><b>West Midlands</b></span><br><span style="color: #FF8201;">Railway</span>
    </p>
  </section>

  <section id="wmr-platform-step" class="hidden flex-col items-center justify-center px-4 text-center h-[50vh]">
    <!-- Top Title -->
    <p id="wmr-platform-step-station" class="text-8xl font-extrabold text-[#FF8201] leading-none mb-8">
      Olton
    </p>

    <!-- Centered Row: Image + Text -->
    <div class="flex flex-row items-center justify-center gap-12 w-full max-w-[90%]">
      <!-- Large Image -->
      <img src={platformStep} alt="Platform Step Icon" class="h-[220px] w-auto object-contain" />

      <!-- Large Text -->
      <p class="text-5xl font-normal text-[#55565A] text-left leading-tight max-w-[50%]">
        Mind the step and gap when you leave the train. Use the handrail if it helps.
      </p>
    </div>
  </section>

  <section id="wmr-platform-pushchair" class="hidden flex-col items-center justify-center px-4 text-center h-[50vh]">
    <!-- Top Title -->
    <p id="wmr-platform-pushchair-station" class="text-8xl font-extrabold text-[#FF8201] leading-none mb-8">
      Olton
    </p>

    <!-- Centered Row: Image + Text -->
    <div class="flex flex-row items-center justify-center gap-12 w-full max-w-[90%]">
      <!-- Large Image -->
      <img src={platformPushcair} alt="Platform Step Icon" class="h-[220px] w-auto object-contain" />

      <!-- Large Text -->
      <p class="text-5xl font-normal text-[#55565A] text-left leading-tight max-w-[50%]">
        Step on to the platform before removing heavy luggage and pushchairs.
      </p>
    </div>
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
</div>


