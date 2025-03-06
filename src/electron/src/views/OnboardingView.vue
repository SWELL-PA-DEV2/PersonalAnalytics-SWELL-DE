<script setup lang="ts">
import StepIndicator from '../components/StepIndicator.vue';
import { computed, onMounted, ref } from 'vue';
import StudyInfoDto from '../../shared/dto/StudyInfoDto';
import typedIpcRenderer from '../utils/typedIpcRenderer';
import StudyInfo from '../components/StudyInfo.vue';
import { LocationQueryValue, useRoute } from 'vue-router';
import studyConfig from '../../shared/study.config';

const windowActivityTrackerEnabled = studyConfig.trackers.windowActivityTracker.enabled;
const requiresAccessibilityPermission =
  studyConfig.trackers.userInputTracker.enabled ||
  (windowActivityTrackerEnabled && studyConfig.trackers.windowActivityTracker.trackUrls);
const requiresScreenRecordingPermission =
  windowActivityTrackerEnabled && studyConfig.trackers.windowActivityTracker.trackWindowTitles;
const requiresAnyPermission = requiresAccessibilityPermission || requiresScreenRecordingPermission;

const currentStep = ref(0);
const transitionName = ref('slide-lef-right');
const isLoading = ref(false);

const studyInfo = ref<StudyInfoDto>();
const permissionCheckInterval = ref<NodeJS.Timeout | null>();
const hasAccessibilityPermission = ref(false);
const hasScreenRecordingPermission = ref(false);
const isAccessibilityPermissionLoading = ref(false);
const isScreenRecordingPermissionLoading = ref(false);

const route = useRoute();
const isMacOS: string | null | LocationQueryValue[] = route.query.isMacOS;
const goToStep: string | null | LocationQueryValue[] = route.query.goToStep;

const availableSteps = ['welcome'];

if (isMacOS === 'true' && requiresAnyPermission) {
  availableSteps.push('data-collection');
} else if (isMacOS === 'false') {
  availableSteps.push('study-trackers-started');
}

if (goToStep === 'study-trackers-started') {
  if (!availableSteps.includes('study-trackers-started')) {
    availableSteps.push('study-trackers-started');
  }
  currentStep.value = availableSteps.indexOf('study-trackers-started');
}

const maxSteps = computed(() => {
  return availableSteps.length;
});

const currentNamedStep = computed(() => {
  return availableSteps[currentStep.value];
});

onMounted(async () => {
  studyInfo.value = await typedIpcRenderer.invoke('getStudyInfo');

  if (isMacOS && requiresAnyPermission) {
    permissionCheckInterval.value = setInterval(async () => {
      if (requiresAccessibilityPermission) {
        hasAccessibilityPermission.value = await triggerPermissionCheckAccessibility(false);
      }
      if (requiresScreenRecordingPermission) {
        hasScreenRecordingPermission.value = await triggerPermissionCheckScreenRecording();
      }
      if (isAccessibilityPermissionLoading.value && hasAccessibilityPermission.value) {
        isAccessibilityPermissionLoading.value = false;
      }
      if (isScreenRecordingPermissionLoading.value && hasScreenRecordingPermission.value) {
        isScreenRecordingPermissionLoading.value = false;
      }
    }, 1000);
  }
});

async function closeOnboardingWindow() {
  await typedIpcRenderer.invoke('closeOnboardingWindow');
}
async function handleNextStep() {
  if (currentStep.value === maxSteps.value - 1) {
    closeOnboardingWindow();
    return;
  }
  transitionName.value = 'slide-left-right';
  currentStep.value++;
}

function handleBackStep() {
  if (currentStep.value === 0) {
    return;
  }
  transitionName.value = 'slide-right-left';
  currentStep.value--;
}

function requestAccessibilityPermission() {
  if (isAccessibilityPermissionLoading.value) {
    return;
  }
  isAccessibilityPermissionLoading.value = true;
  triggerPermissionCheckAccessibility(true);
}

async function requestScreenRecordingPermission(): Promise<void> {
  if (isScreenRecordingPermissionLoading.value) {
    return;
  }
  isScreenRecordingPermissionLoading.value = true;
  const hasPermission = await triggerPermissionCheckScreenRecording();
  if (!hasPermission) {
    startAllTrackers();
  }
}

function triggerPermissionCheckAccessibility(prompt: boolean): Promise<boolean> {
  return typedIpcRenderer.invoke('triggerPermissionCheckAccessibility', prompt);
}

function triggerPermissionCheckScreenRecording(): Promise<boolean> {
  return typedIpcRenderer.invoke('triggerPermissionCheckScreenRecording');
}

function startAllTrackers() {
  typedIpcRenderer.invoke('startAllTrackers');
}
</script>

<template>
  <div class="onboarding-view h-screen">
    <div v-if="!studyInfo" class="flex h-full w-full items-center justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else class="relative flex h-full flex-col justify-between dark:text-neutral-400">
      <transition-group :name="transitionName">
        <div v-if="currentNamedStep === 'welcome'" key="0" class="flex w-full flex-col">
          <div class="flex flex-row">
            <img
              class="self-center"
              src="../assets/logo.svg"
              alt="PersonalAnalytics Logo"
              width="80"
            />
            <h1
              id="title"
              class="ml-5 self-center text-3xl font-medium text-neutral-800 dark:text-neutral-300"
            >
              Willkommen zu {{ studyInfo.studyName }}
            </h1>
          </div>
          <StudyInfo :study-info="studyInfo" />
        </div>
        <div v-else-if="currentNamedStep === 'data-collection'" key="1" class="absolute">
          <h1 class="mb-8 text-3xl font-medium text-neutral-800 dark:text-neutral-300">
            Grant Permissions
          </h1>
          <div class="text-md">
            <p>
              Diese Studie verwendet PersonalAnalytics, um Daten zur Computerinteraktion zu speichern,
              einschliesslich App-Namen, Fenstertitel sowie Benutzereingaben von Maus und Tastatur.
              Die Daten werden <span class="font-bold dark:text-slate-200">ausschliesslich lokal gespeichert</span> und
              <span class="font-bold dark:text-slate-200"><span class="italic">nicht</span> ohne Ihre ausdrückliche Erlaubnis</span>
              mit den Forschenden geteilt.
            </p>
            <div class="flex flex-col">
              <div v-if="requiresAccessibilityPermission" class="my-5 flex flex-col">
                <p>
                  Um PersonalAnalytics zu ermöglichen, Computerinteraktionsdaten auf macOS zu sammeln,
                müssen Sie die entsprechenden Berechtigungen erteilen.
                </p>
                <p>
                  Um PersonalAnalytics den Zugriff auf Benutzereingabedaten zu ermöglichen,
                  öffnen Sie bitte die Bedienungshilfen-Einstellungen(auf macOS) und erteilen Sie die Berechtigung,
                  indem Sie den Eintrag für PersonalAnalytics aktivieren.
                </p>
                <div class="flex items-center justify-center pt-8">
                  <button
                    v-if="!hasAccessibilityPermission"
                    class="btn btn-active w-64"
                    @click="requestAccessibilityPermission()"
                  >
                    <span v-if="isAccessibilityPermissionLoading">
                      <span class="loading loading-spinner loading-xs" />
                    </span>
                    <span v-else>Zugriff auf Bedienungshilfe erlauben</span>
                  </button>
                  <div v-else class="flex flex-row">
                    <svg
                      class="h-6 w-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M5 13l4 4L19 7"
                      />
                      <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" />
                    </svg>

                    <span class="ml-2 text-green-500">Zugriff auf Bedienungshilfe erlaubt</span>
                  </div>
                </div>
              </div>
              <div v-if="requiresScreenRecordingPermission" class="my-5 flex flex-col">
                <p>
                  Um PersonalAnalytics den Zugriff auf Fenstertitel von Apps zu ermöglichen,
                  öffnen Sie bitte die Einstellungen für Bildschirmaufnahmen (auf macOS) und erteilen Sie die Berechtigung,
                  indem Sie den Eintrag für PersonalAnalytics aktivieren.
                </p>
                <p>
                  Bitte beachten Sie, dass für Ihre Tastatureingaben nur die Anzahl der Anschläge,
                  nicht aber die genauen Tasten gespeichert werden. Ihr Bildschirm oder Audio wird nicht aufgezeichnet.
                </p>
                <div class="flex items-center justify-center pt-8">
                  <button
                    v-if="!hasScreenRecordingPermission"
                    class="btn btn-active w-64"
                    :disabled="requiresAccessibilityPermission && !hasAccessibilityPermission"
                    @click="requestScreenRecordingPermission()"
                  >
                    <span v-if="isScreenRecordingPermissionLoading">
                      <span class="loading loading-spinner loading-xs" />
                    </span>
                    <span v-else>Zugriff auf Bildschirmaufnahme erlauben</span>
                  </button>
                  <div v-else class="flex flex-row">
                    <svg
                      class="h-6 w-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M5 13l4 4L19 7"
                      />
                      <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" />
                    </svg>

                    <span class="ml-2 text-green-500">Zugriff auf BIldschirmaufnahme erlaubt</span>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="requiresScreenRecordingPermission" class="mt-6">
              Nachdem Sie die Berechtigungen erteilt haben, werden Sie aufgefordert, PersonalAnalytics zu schliessen und neu zu starten.
              Bitte starten Sie die App manuell neu, falls dies nicht automatisch geschieht.
            </p>
          </div>
        </div>
        <div v-else-if="currentNamedStep === 'study-trackers-started'" key="2" class="absolute">
          <h1 class="mb-8 text-3xl font-medium text-neutral-800 dark:text-neutral-300">
            PersonalAnalytics läuft
          </h1>
          <article class="prose prose-lg max-w-none">
            <p v-if="requiresAnyPermission">
              Vielen Dank, dass Sie PersonalAnalytics eingerichtet und an der {{ studyInfo.studyName }} Studie teilnehmen.
              Die App läuft nun im Hintergrund, und Sie können jederzeit über die Menüleiste darauf zugreifen.
              Dort haben Sie die Möglichkeit, Support zu erhalten und auf die gesammelten Daten zuzugreifen.
            </p>
            <p v-else>
              Vielen Dank, dass Sie PersonalAnalytics eingerichtet und an der {{ studyInfo.studyName }} Studie teilnehmen.
              Die App läuft nun im Hintergrund, und Sie können jederzeit über die Taskleiste darauf zugreifen.
              Dort haben Sie die Möglichkeit, Support zu erhalten und auf die gesammelten Daten zuzugreifen. 
              Bitte beachten Sie, dass das Icon in der Taskleiste versteckt sein kann.
              overflow.
            </p>
            <p>
              Die folgenden Monitors laufen derzeit:
              {{ studyInfo.currentlyActiveTrackers.join(', ') }}
            </p>

            <p>
              Kontaktieren Sie {{ studyInfo.contactName }} (<a :href="'mailto:' + studyInfo.contactEmail" target="_blank">{{ studyInfo.contactEmail }}</a>) im Falle von Fragen.
            </p>
          </article>
        </div>
      </transition-group>

      <div class="flex-grow" />
      <div id="footer" class="z-10 mt-auto flex items-center justify-between">
        <button
          class="btn btn-outline"
          type="button"
          :disabled="currentStep === 0"
          @click="handleBackStep"
        >
          Back
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
.onboarding-view {
  padding: 25px;
}
</style>
