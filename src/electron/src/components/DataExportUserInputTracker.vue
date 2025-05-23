<script setup lang="ts">
import { ref, PropType } from 'vue';
import StudyInfoDto from '../../shared/dto/StudyInfoDto';
import { DataExportType } from '../../shared/DataExportType.enum';
import UserInputDto from '../../shared/dto/UserInputDto';

const props = defineProps({
  studyInfo: {
    type: Object as PropType<StudyInfoDto>,
    default: null,
    required: false
  },
  data: {
    type: Object as PropType<UserInputDto[]>,
    default: null,
    required: false
  },
  defaultValue: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['change']);

const selectedOption = ref<string>(props.defaultValue);

const emitChange = () => {
  emits('change', selectedOption.value);
};
</script>
<template>
  <div class="my-5 border border-slate-400 p-2">
    <div class="prose">
      <h2>Wie möchten Sie Ihre Benutzereingabedaten teilen?</h2>
    </div>
    <div class="mt-4 flex w-1/3 flex-col">
      <div class="form-control">
        <label class="label flex cursor-pointer items-center justify-start">
          <input
            v-model="selectedOption"
            type="radio"
            :value="DataExportType.All"
            class="radio checked:bg-blue-500"
            @change="emitChange"
          />
          <span class="label-text ml-2">Daten unverändert teilen</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label flex cursor-pointer items-center justify-start">
          <input
            v-model="selectedOption"
            type="radio"
            :value="DataExportType.None"
            class="radio checked:bg-blue-500"
            @change="emitChange"
          />
          <span class="label-text ml-2">Daten nicht teilen</span>
        </label>
      </div>
    </div>
    <div class="prose mt-5">
      <p>Hier ist eine Beispielansicht Ihrer anonymisierten Benutzereingabedaten:</p>
    </div>
    <div
      class="relative mt-5"
      :class="{
        'cursor-not-allowed overflow-hidden opacity-50': selectedOption === DataExportType.None
      }"
    >
      <div
        v-if="selectedOption === DataExportType.None"
        class="absolute inset-0 z-10 flex items-center justify-center bg-slate-800 bg-opacity-40"
      >
        <p class="bg-slate-800 p-5 text-lg text-white">Diese Daten werden nicht geteilt</p>
      </div>
      <div class="max-h-48 w-full overflow-y-auto">
        <table class="table table-zebra table-pin-rows max-h-48 w-full text-xs">
          <thead class="border-b">
            <tr>
              <th>Zahl der Tastenanschläge</th>
              <th>Zahl der Klicks</th>
              <th>Maus-Bewegung</th>
              <th>Maus-Scrolling</th>
              <th>Startzeit</th>
              <th>Endzeit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="windowActivity in data" :key="windowActivity.id">
              <td>{{ windowActivity.keysTotal }}</td>
              <td>{{ windowActivity.clickTotal }}</td>
              <td>{{ windowActivity.movedDistance }}</td>
              <td>{{ windowActivity.scrollDelta }}</td>
              <td>{{ windowActivity.tsStart.toLocaleString() }}</td>
              <td>{{ windowActivity.tsEnd.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<style lang="less">
@import '../styles/index';
</style>
