<script setup lang="ts">
import { PropType } from 'vue';
import ExperienceSamplingDto from '../../shared/dto/ExperienceSamplingDto';

defineProps({
  data: {
    type: Object as PropType<ExperienceSamplingDto[]>,
    default: null,
    required: false
  }
});
</script>
<template>
  <div class="my-5 border border-slate-400 p-2">
    <div class="prose">
      <h2>Ihre Umfrage-Antworten</h2>
      <p>Dies ist ein Auszug der unveränderten Umfrage-Antworten:</p>
    </div>
    <div class="max-h-48 overflow-auto">
      <table
        class="table table-zebra table-pin-rows w-full overflow-auto text-xs"
      >
        <thead class="border-b">
          <tr>
            <th>Frage</th>
            <th>Antwort</th>
            <th>Skala</th>
            <th>Antwortoptionen</th>
            <th>Ausgelassen</th>
            <th>Zeitpunkt</th>
          </tr>
        </thead>
        <tbody class="">
          <tr v-for="d in data" :key="d.id">
            <td>{{ d.question }}</td>
            <td>{{ d.response }}</td>
            <td>{{ d.scale }}</td>
            <td>{{ d.responseOptions }}</td>
            <td>{{ d.skipped }}</td>
            <td>{{ d.promptedAt.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex">
      <div class="mr-4">
        <div class="prose prose-lg max-w-none">
          <p>
            Ihre Antworten auf die Fragen zur Erfassung von Erlebnissen werden auch mit den 
            Forschern geteilt. Sie enthalten keine sensiblen Daten.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
