<script setup lang="ts">
import StepIndicator from '../components/StepIndicator.vue';
import { computed, onMounted, ref } from 'vue';
import StudyInfoDto from '../../shared/dto/StudyInfoDto';
import typedIpcRenderer from '../utils/typedIpcRenderer';
import studyConfig from '../../shared/study.config';
import DataExportWindowActivityTracker from '../components/DataExportWindowActivityTracker.vue';
import DataExportUserInputTracker from '../components/DataExportUserInputTracker.vue';
import { DataExportType } from '../../shared/DataExportType.enum';
import WindowActivityDto from '../../shared/dto/WindowActivityDto';
import UserInputDto from '../../shared/dto/UserInputDto';
import DataExportExperienceSamplingTracker from '../components/DataExportExperienceSamplingTracker.vue';
import ExperienceSamplingDto from '../../shared/dto/ExperienceSamplingDto';
import getRendererLogger from '../utils/Logger';

const LOG = getRendererLogger('DataExportView');

const currentStep = ref(0);
const transitionName = ref('slide-lef-right');
const isLoading = ref(true);
const studyDescriptionExpanded = ref(false);

const studyInfo = ref<StudyInfoDto>();

const mostRecentExperienceSamples = ref<ExperienceSamplingDto[]>();
const mostRecentUserInputs = ref<UserInputDto[]>();
const mostRecentWindowActivities = ref<WindowActivityDto[]>();
const mostRecentWindowActivitiesObfuscated = ref<WindowActivityDto[]>();
const obfuscateWindowActivities = ref(false);

const exportExperienceSamplesSelectedOption = ref<DataExportType>(DataExportType.None);
const exportWindowActivitySelectedOption = ref<DataExportType>(DataExportType.None);
const exportUserInputSelectedOption = ref<DataExportType>(DataExportType.None);

const obfuscationTermsInput = ref<string[]>();

const isExporting = ref(false);
const hasExportError = ref(false);

const pathToExportedFile = ref('');
const fileName = ref('');

const availableSteps = ['export-1', 'export-2', 'create-export'];

const maxSteps = computed(() => {
  return availableSteps.length;
});

const currentNamedStep = computed(() => {
  return availableSteps[currentStep.value];
});

onMounted(async () => {
  studyInfo.value = (await typedIpcRenderer.invoke('getStudyInfo')) as StudyInfoDto;
  if (studyConfig.trackers.experienceSamplingTracker.enabled) {
    exportExperienceSamplesSelectedOption.value = DataExportType.All;
    mostRecentExperienceSamples.value = await typedIpcRenderer.invoke(
      'getMostRecentExperienceSamplingDtos',
      20
    );
  }
  if (studyConfig.trackers.windowActivityTracker.enabled) {
    exportWindowActivitySelectedOption.value = DataExportType.All;
    mostRecentWindowActivities.value = await typedIpcRenderer.invoke(
      'getMostRecentWindowActivityDtos',
      20
    );
  }
  if (studyConfig.trackers.userInputTracker.enabled) {
    exportUserInputSelectedOption.value = DataExportType.All;
    mostRecentUserInputs.value = await typedIpcRenderer.invoke('getMostRecentUserInputDtos', 20);
  }
  isLoading.value = false;
});

async function handleWindowActivityExportConfigChanged(newSelectedOption: DataExportType) {
  if (mostRecentWindowActivities.value && newSelectedOption === DataExportType.Obfuscate) {
    mostRecentWindowActivitiesObfuscated.value = await typedIpcRenderer.invoke(
      'obfuscateWindowActivityDtosById',
      mostRecentWindowActivities.value.map((d) => d.id)
    );
    obfuscateWindowActivities.value = true;
  } else if (
    newSelectedOption === DataExportType.All ||
    newSelectedOption === DataExportType.ObfuscateWithTerms
  ) {
    obfuscateWindowActivities.value = false;
    mostRecentWindowActivities.value = await typedIpcRenderer.invoke(
      'getMostRecentWindowActivityDtos',
      20
    );
  }
  exportWindowActivitySelectedOption.value = newSelectedOption;
}

async function handleObfuscationTermsChanged(newObfuscationTerms: string) {
  if (!newObfuscationTerms || newObfuscationTerms.trim().length === 0) {
    obfuscationTermsInput.value = [];
  } else {
    obfuscationTermsInput.value = newObfuscationTerms
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }
}

async function handleObfuscateSampleData() {
  if (
    obfuscationTermsInput.value &&
    obfuscationTermsInput?.value?.length > 0 &&
    mostRecentWindowActivities.value
  ) {
    mostRecentWindowActivities.value = mostRecentWindowActivities.value?.map((item) => {
      let windowTitle = item.windowTitle;
      let url = item.url;
      obfuscationTermsInput.value?.forEach((term) => {
        if (
          windowTitle?.toLowerCase().includes(term.toLowerCase()) ||
          url?.toLowerCase().includes(term.toLowerCase())
        ) {
          windowTitle = windowTitle ? '[anonymized]' : windowTitle;
          url = url ? '[anonymized]' : url;
        }
      });
      return { ...item, windowTitle, url };
    });
  } else {
    mostRecentWindowActivities.value = await typedIpcRenderer.invoke(
      'getMostRecentWindowActivityDtos',
      20
    );
  }
}

function handleExperienceSamplingConfigChanged(newSelectedOption: DataExportType) {
  exportExperienceSamplesSelectedOption.value = newSelectedOption;
}

function handleUserInputExportConfigChanged(newSelectedOption: DataExportType) {
  exportUserInputSelectedOption.value = newSelectedOption;
}

function closeDataExportWindow() {
  typedIpcRenderer.invoke('closeDataExportWindow');
}

async function handleNextStep() {
  if (currentStep.value === maxSteps.value - 1) {
    closeDataExportWindow();
    return;
  }

  transitionName.value = 'slide-left-right';
  currentStep.value++;
  if (currentNamedStep.value === 'create-export') {
    isExporting.value = true;
    try {
      let obfuscationTerms: string[] = [];
      if (
        exportWindowActivitySelectedOption.value === DataExportType.ObfuscateWithTerms &&
        obfuscationTermsInput.value &&
        obfuscationTermsInput.value.length > 0
      ) {
        obfuscationTerms = Array.from(obfuscationTermsInput.value);
      }
      pathToExportedFile.value = await typedIpcRenderer.invoke(
        'startDataExport',
        exportWindowActivitySelectedOption.value,
        exportUserInputSelectedOption.value,
        obfuscationTerms,
        studyConfig.dataExportEncrypted
      );
      hasExportError.value = false;
      const now = new Date();
      const nowStr = now.toISOString().replace(/:/g, '-').replace('T', '_').slice(0, 16);
      // Also update the DataExportService if you change the file name here
      fileName.value = `PA_${studyInfo.value?.subjectId}_${nowStr}.sqlite`;
    } catch (e) {
      LOG.error(e);
      hasExportError.value = true;
    }
    isExporting.value = false;
  }
}

function handleBackStep() {
  if (currentStep.value === 0) {
    return;
  }
  transitionName.value = 'slide-right-left';
  currentStep.value--;
}

function openUploadUrl(event: Event) {
  typedIpcRenderer.invoke('openUploadUrl');
  event.preventDefault();
}

function revealItemInFolder(event: Event) {
  typedIpcRenderer.invoke('revealItemInFolder', pathToExportedFile.value);
  event.preventDefault();
}
</script>

<template>
  <div class="h-screen p-5">
    <div
      v-if="!studyInfo || isExporting"
      class="flex h-full w-full items-center justify-center overflow-y-scroll"
    >
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else class="relative flex h-full flex-col justify-between dark:text-neutral-400">
      <div class="mb-5 flex-grow overflow-y-auto">
        <transition-group :name="transitionName">
          <div v-if="currentNamedStep === 'export-1'" key="0" class="flex w-full flex-col">
            <h1 class="mb-8 text-4xl font-medium text-neutral-800 dark:text-neutral-300">
              Daten-Export
            </h1>
            <article class="prose prose-lg max-w-none">
              <p>
                Vielen Dank für Ihre Teilnahme an der '{{ studyConfig.name }}'-Studie! Bisher wurden alle gesammelten Daten
                <b class="dark:text-white">nur lokal auf Ihrem Gerät gespeichert</b>. In diesem Schritt
                möchten die Forschenden Sie bitten, diese Daten für die Analyse und eine mögliche 
                Veröffentlichung in wissenschaftlichen Fachzeitschriften zu teilen.
              </p>
              <p>
                Bitte klicken Sie auf <b class="dark:text-white">"Weiter"</b> sobald Sie bereit sind,
                <b class="dark:text-white">Ihre Daten zunächst zu überprüfen und später zu teilen</b>.
                <span v-if="studyConfig.dataExportEncrypted">
                  Der Export, der mit Ihrer Erlaubnis im nächsten Schritt erstellt wird, 
                  wird verschlüsselt und passwortgeschützt sein.</span
                >
              </p>
              <p class="mb-4">
                Unten finden Sie weitere Informationen zur Studie und dazu, wie die Forschenden
                Ihre Datenprivatsphäre und -sicherheit gewährleisten.
              </p>
              <table class="table-auto text-sm">
                <tbody>
                  <tr>
                    <td>Kontakt:</td>
                    <td>{{ studyInfo.contactName }} (<a :href="'mailto:' + studyInfo.contactEmail" target="_blank">{{ studyInfo.contactEmail }}</a>)</td>
                  </tr>
                  <tr>
                    <td>Website zur Studie:</td>
                    <td>
                      <a :href="studyInfo.infoUrl" target="_blank">{{ studyInfo.infoUrl }}</a>
                    </td>
                  </tr>
                  <tr>
                    <td>Datenschutzerklärung:</td>
                    <td>
                      <a :href="studyInfo.privacyPolicyUrl" target="_blank">{{
                        studyInfo.privacyPolicyUrl
                      }}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="w-40 align-top">Beschreibung zur Studie:</td>
                    <td>
                      <!-- <div class="collapse bg-base-200">
                        <input v-model="studyDescriptionExpanded" type="checkbox" />
                        <div class="collapse-title text-sm">
                          Click to {{ studyDescriptionExpanded ? 'collapse' : 'expand' }} Study
                          Description
                        </div>
                        <div class="collapse-content" v-html="studyInfo.shortDescription" />
                      </div> -->
                      <div v-html="studyInfo.shortDescription"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
          <div v-if="currentNamedStep === 'create-export'" key="2" class="flex w-full flex-col">
            <h1 class="mb-8 text-4xl font-medium text-neutral-800 dark:text-neutral-300">
              Ihr Export ist bereit für den Upload
            </h1>
            <article class="prose prose-lg max-w-none">
              <p>
                Vielen Dank, dass Sie Ihre Daten für die '{{ studyConfig.name }}'-Studie überprüft und exportiert haben.
              </p>
              <p>
                Ihre Daten wurden exportiert und wir haben ein
                <span v-if="studyConfig.dataExportEncrypted"
                  >passwort-geschütztes und verschlüsseltes
                </span>
                File basierend auf Ihren Präferenzen auf der vorherigen Seite erstellt. Um dieses File mit den Forschenden zu teilen,
                befolgen Sie bitte folgende Schritte:
              </p>
              <ol>
                <li>
                  <a href="#" @click="revealItemInFolder">Klicken Sie hier</a> um den Ordner zu öffnen,
                  welcher ihre exportierten Daten enthält (<span
                    class="badge badge-neutral font-bold text-white"
                    >{{ fileName }}</span
                  >).
                </li>
                <li>
                  <a href="#" @click="openUploadUrl">Klicken Sie hier</a> um die Upload-Seite zu öffnen
                </li>
                <li>
                  Laden Sie das File mit dem Namen
                  <span class="badge badge-neutral font-bold text-white">{{ fileName }}</span> auf die Upload-Seite hoch.
                </li>
              </ol>
              <p>
                Bitte kontaktieren Sie {{ studyConfig.contactName }} ({{ studyConfig.contactEmail }}) 
                im Falle von Fragen oder Problemen. Besten Dank!
              </p>
              <p v-if="studyConfig.dataExportEncrypted">
                Wenn Sie die vollständige Datendatei vor dem Teilen mit den Forschenden überprüfen möchten,
                lesen Sie bitte diese Anleitung. Das <b class="dark:text-white">Passwort</b> für das Öffnen des
                exportierten Files lautet:
                <span class="password-badge">PersonalAnalytics_{{ studyInfo.subjectId }}</span
                >.
              </p>
            </article>
          </div>
          <div v-if="currentNamedStep === 'export-2'" key="1" class="-mt-5">
            <DataExportWindowActivityTracker
              v-if="studyConfig.trackers.windowActivityTracker.enabled"
              :study-info="studyInfo"
              :data="
                obfuscateWindowActivities
                  ? mostRecentWindowActivitiesObfuscated
                  : mostRecentWindowActivities
              "
              :should-obfuscate="obfuscateWindowActivities"
              :default-value="exportWindowActivitySelectedOption"
              @option-changed="handleWindowActivityExportConfigChanged"
              @obfuscation-terms-changed="handleObfuscationTermsChanged"
              @obfuscate-sample-data="handleObfuscateSampleData"
            />
            <DataExportUserInputTracker
              v-if="studyConfig.trackers.windowActivityTracker.enabled"
              :study-info="studyInfo"
              :data="mostRecentUserInputs"
              :default-value="exportUserInputSelectedOption"
              @change="handleUserInputExportConfigChanged"
            />
            <DataExportExperienceSamplingTracker
              v-if="studyConfig.trackers.windowActivityTracker.enabled"
              :study-info="studyInfo"
              :data="mostRecentExperienceSamples"
              :default-value="exportExperienceSamplesSelectedOption"
              @change="handleExperienceSamplingConfigChanged"
            />
          </div>
        </transition-group>
      </div>
      <div id="footer" class="z-10 mt-auto flex items-center justify-between">
        <button
          class="btn btn-outline"
          type="button"
          :disabled="currentStep === 0"
          @click="handleBackStep"
        >
          Zurück
        </button>
        <StepIndicator v-if="maxSteps > 1" :current-step="currentStep" :total-steps="maxSteps" />
        <button
          class="btn btn-active btn-md"
          type="button"
          :disabled="isLoading"
          @click="handleNextStep"
        >
          <template v-if="currentStep === maxSteps - 1">Schliessen </template>
          <template v-else> Weiter </template>
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
@import '../styles/variables.less';
.password-badge {
  @apply badge badge-neutral font-bold text-white;
  background-color: @primary-color;
}
</style>
