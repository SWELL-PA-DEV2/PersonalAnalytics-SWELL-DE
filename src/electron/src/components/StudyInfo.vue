<script setup lang="ts">
import { PropType } from 'vue';
import StudyInfoDto from '../../shared/dto/StudyInfoDto';

defineProps({
  studyInfo: {
    type: Object as PropType<StudyInfoDto>,
    required: true
  }
});
</script>
<template>
  <article class="prose prose-lg mt-4">
    <h2>Infos zur Studie</h2>
    <div class="-mr-6 max-h-64 overflow-y-auto pr-4">
      <div class="my-0 text-base" v-html="studyInfo.shortDescription" />
    </div>
    <table class="table-auto">
      <tbody>
        <tr>
          <td class="w-40">Ihre Teilnehmenden-ID:</td>
          <td>
            <span class="subject-badge">{{ studyInfo.subjectId }}</span>
          </td>
        </tr>
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
      </tbody>
    </table>
  </article>
</template>
<style lang="less">
@import '../styles/index';
.subject-badge {
  @apply badge badge-neutral text-white;
  background-color: @primary-color;
}
</style>
