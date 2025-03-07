<script lang="ts" setup>
import typedIpcRenderer from '../../utils/typedIpcRenderer';
import { onMounted, ref } from 'vue';
import StudyInfoDto from '../../../shared/dto/StudyInfoDto';
import StudyInfo from '../../components/StudyInfo.vue';

const studyInfo = ref<StudyInfoDto>();

const openLogs = () => {
  typedIpcRenderer.invoke('openLogs');
};

const openCollectedData = () => {
  typedIpcRenderer.invoke('openCollectedData');
};

onMounted(async () => {
  studyInfo.value = await typedIpcRenderer.invoke('getStudyInfo');
});
</script>
<template>
  <div class="h-full overflow-y-scroll">
    <div v-if="!studyInfo" class="flex h-full w-full items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else class="mt-4">
      <article class="prose prose-lg mt-4">
        <h1 class="relative">
          <span class="primary-blue">{{ studyInfo.studyName }}</span>
          <span class="badge badge-neutral absolute top-0">v{{ studyInfo.appVersion }}</span>
        </h1>
      </article>

      <div class="z-10 mt-10 mb-10 flex items-center">
        <button class="btn btn-outline btn-sm mr-5" type="button" @click="openLogs">
          Logdaten öffnen
        </button>
        <button class="btn btn-outline btn-sm" type="button" @click="openCollectedData">
          Gespeicherte Daten öffnen
        </button>
      </div>

      <StudyInfo :study-info="studyInfo" />

      <article class="prose prose-lg mt-4"> 
        <h2 class="mt-0">Info über das PersonalAnalytics-Tool</h2>
        <p class="text-base">
          PersonalAnalytics ist eine Software, die vom Human Aspects of Software Engineering Lab der 
          Universität Zürich entwickelt wurde, um Computer-Interaktionsdaten nicht-intrusiv zu erfassen,
          sie lokal auf dem Rechner des Nutzers zu speichern und es den Nutzern zu ermöglichen, 
          freiwillig eine vom Nutzer definierte und potenziell anonymisierte Teilmenge der Daten mit 
          Forschern für wissenschaftliche Zwecke zu teilen.
        </p>
        <table class="table-auto">
          <tbody>
            <tr>
              <td class="w-40">Aktive Datenmonitoren:</td>
              <td>{{ studyInfo.currentlyActiveTrackers.join(', ') }}</td>
            </tr>
            <tr>
              <td>Kontakt:</td>
              <td>André Meyer (ameyer@ifi.uzh.ch)</td>
            </tr>
            <tr>
              <td>Website:</td>
              <td>
                <a href="https://github.com/HASEL-UZH/PersonalAnalytics" target="_blank"
                  >https://github.com/HASEL-UZH/PersonalAnalytics</a
                >
              </td>
            </tr>
            <tr>
              <td>Datenschutzbestimmungen:</td>
              <td>
                <a
                  href="https://github.com/HASEL-UZH/PersonalAnalytics/blob/dev-am/documentation/PRIVACY.md"
                  target="_blank"
                  >https://github.com/HASEL-UZH/PersonalAnalytics/blob/dev-am/documentation/PRIVACY.md</a
                >
              </td>
            </tr>
          </tbody>
        </table>
        <p class="text-base">
          Verschiedene Versionen von PersonalAnalytics wurden in mehr als einem Dutzend Feldstudien mit Hunderten 
          von Nutzer:innen umfassend getestet. Obwohl die Software auf den meisten Systemen zuverlässig läuft, 
          können gelegentliche Softwareprobleme nicht ausgeschlossen werden. Die Nutzung dieser Software erfolgt 
          auf eigenes Risiko. Die Entwickler:innen der Software übernehmen keine Haftung für Schäden oder Konsequenzen, 
          einschließlich, aber nicht beschränkt auf Schäden oder Verluste, die durch die Nutzung, Modifikation oder 
          den Missbrauch der Software entstehen. Die Software wird unter einer Open-Source-Lizenz wie gesehen ("as-is") 
          Forscher:innen und Nutzer:innen bereitgestellt und kann über den oben angegebenen Link eingesehen werden.
        </p>
        <div class="float-end flex pb-7">
          <a href="https://www.uzh.ch" target="_blank" class="mr-5">
            <img src="../../assets/logo_uzh.svg" class="m-0 w-44 object-contain" alt="UZH Logo" />
          </a>
          <a href="https://hasel.dev" target="_blank">
            <img src="../../assets/logo_hasel.svg" class="m-0 w-44 object-contain" alt="HASEL Logo" />
          </a>
        </div>
      </article>
    </div>
  </div>
</template>
<style lang="less">
@import '../../styles/index';
.primary-blue {
  color: @primary-color;
}
</style>
