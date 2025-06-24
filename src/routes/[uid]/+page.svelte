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
  let nextLineup: RTTLocationLineup | undefined;
  let fullCallRead: string[] = ['DDG', 'WTE', 'TYS', 'SMA', 'BMO', 'BSW', 'SBJ', 'KID', 'DTW', 'WOS', 'WOF'];

  const inbetweenStationsLoop = new LoopController(async () => {
    fem.thisTrainIsFor(currentData.for);
    await new Promise(res => setTimeout(res, 10_000));
    if (!inbetweenStationsLoop.isRunning()) return;
    // calling at
    fem.connections(currentData.location);
    await new Promise(res => setTimeout(res, 10_000));
    if (!inbetweenStationsLoop.isRunning()) return;
    // photos
    //inbetweenStationsLoop.stop();
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

  const terminateLoop = new LoopController(async () => {
    fem.thisIsFinal(currentData.location);
    //await new Promise(res => setTimeout(res, 10_000));
    //if (!terminateLoop.isRunning()) return;
    //fem.thisTrainIsFor(currentData.for);
    //atStationLoop.stop();
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

    // Next station data lineup
    setInterval(async () => {
      if (currentData.locationCode == null) {
        nextLineup = undefined;
        return;
      }

      nextLineup = await bem.getLocationLineup(currentData.locationCode);
    }, 60 * 1000)

    setInterval(async () => {
      let data = await bem.whereIsTrain(serviceUid);

      if (currentData.location != data.location) {
        fem.theNextStationIs(data.location);
        currentData = data;
        nowApproaching = false;
        welcomeTo = false;
        nextLineup = await bem.getLocationLineup(currentData.locationCode);
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
          files.push({ id: 'our final destination', opts: { delayStart: 200 } });
        }

        if (data.locationCode == "SBJ") {
          files.push({ id: 'change here for', opts: { delayStart: 300 } });
          files.push({ id: 'stations.SBT', opts: { delayStart: 200 } })
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
        if (data.locationCode != data.forCode)
          atStationLoop.start();
        else
          terminateLoop.start();
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

        var table: HTMLTableElement = document.getElementById("wmr-connections-table") as HTMLTableElement;
        for(var i = table.rows.length - 1; i > 0; i--)
        {
            table.deleteRow(i);
        }

        if (nextLineup == undefined) {
          document.getElementById('wmr-connections-unavailable')!!.style.display = "flex";
          return;
        } else {
          document.getElementById('wmr-connections-unavailable')!!.style.display = "hidden";
        }

        var count = 0;
        nextLineup.services.forEach(data => {
          if (data.serviceUid == serviceUid)
            return;

          if (count == 5)
            return;
          count++;

          var row = table.insertRow();
          row.classList.add('border-b');
          row.classList.add('border-gray-300');
          row.classList.add('text-2xl');
          row.classList.add('font-medium');

          var time = row.insertCell(0);
          time.innerHTML = data.locationDetail.gbttBookedDeparture;
          time.classList.add('py-2');
          time.classList.add('px-4');

          var dest = row.insertCell(1);
          dest.innerHTML = data.locationDetail.destination[0]!!.description;
          dest.classList.add('py-2');
          dest.classList.add('px-4');

          var plat = row.insertCell(2);
          if (data.locationDetail.platform != undefined)
            plat.innerHTML = data.locationDetail.platform;
          plat.classList.add('py-2');
          plat.classList.add('px-4');
          plat.classList.add("text-center");

          var expt = row.insertCell(3);
          expt.classList.add('py-2');
          expt.classList.add('px-4');
          expt.classList.add("text-center");
          if (data.locationDetail.gbttBookedDeparture+2 <= data.locationDetail.realtimeDeparture) {
            expt.innerHTML = data.locationDetail.realtimeDeparture;
            expt.classList.add("text-red-600");
          } else {
            expt.innerHTML = "On Time"
          }
        });
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
      <div id="wmr-journey-complete">
        <p id="wmr-double-top" class="text-5xl text-gray-600 mb-2 leading-none" style="color: #55565A;">
          <br>
          This train completes its journey here.
          <br>
          <br>
          Thank you for travelling with
          <br>
          <span style="color: #FF8201;">West Midlands Railway.</span>
        </p>
      </div>
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

  <section id="wmr-connections" class="hidden w-full bg-white text-[#55565A] px-6 py-8">
    <div class="flex flex-col w-full">
      
      <!-- Title with ID -->
      <h2 id="wmr-connections-title" class="text-4xl font-bold mb-6">Olton Connections</h2>
      
      <!-- Table -->
      <div class="overflow-x-auto">
        <table id="wmr-connections-table" class="w-full text-left border-separate" style="border-spacing: 8px 0;">
          <thead>
            <tr class="text-white text-xl">
              <th class="py-2 px-4" style="background-color: #55565A;">TIME</th>
              <th class="py-2 px-4" style="background-color: #55565A;">DESTINATION</th>
              <th class="py-2 px-4" style="background-color: #55565A;">PLAT.</th>
              <th class="py-2 px-4" style="background-color: #55565A;">EXPECTED</th>
            </tr>
          </thead>
          <tbody class="text-2xl font-medium">
          </tbody>
        </table>
        <div id="wmr-connections-unavailable">
          <br><br> 
          <p class="text-center text-2xl">Onward journey information temporarily unavailable, please wait.</p>
        </div>
      </div>

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


