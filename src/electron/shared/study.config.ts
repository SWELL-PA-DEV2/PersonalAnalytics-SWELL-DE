import { StudyConfiguration } from './StudyConfiguration';

const studyConfig: StudyConfiguration = {
  name: 'SWeLL - Studenteenwohlbefinden und -Lernen auf Laptops',
  shortDescription: 'Das Ziel der Studie ist es, zu verstehen, wie Studierende aus verschiedenen Fachrichtungen Laptops und Tablets für ihr Studium nutzen, welchen Einfluss dies auf ihr Wohlbefinden hat und wie digitale Lernprozesse optimiert werden können. Eine detaillierte Beschreibung der Studie finden Sie <a href="https://mydata-lab.uzh.ch/de/studien/swell.html" target=_blank">hier</a>.',
  infoUrl: 'https://mydata-lab.uzh.ch/de/studien/swell.html',
  privacyPolicyUrl: 'https://mydata-lab.uzh.ch/de/studien/swell.html',
  uploadUrl: 'https://hasel.dev/swell-upload',
  contactName: 'Dr. Malte Doehne, Andreas Baumer, Dr. Andre Meyer',
  contactEmail: 'swell@d2usp.ch',
  subjectIdLength: 6,
  dataExportEnabled: true,
  dataExportEncrypted: false,
  displayDaysParticipated: true,
  trackers: {
    windowActivityTracker: {
      enabled: true,
      intervalInMs: 1000,
      trackUrls: false,
      trackWindowTitles: true
    },
    userInputTracker: {
      enabled: true,
      intervalInMs: 10000
    },
    experienceSamplingTracker: {
      enabled: true,
      enabledWorkHours: false,
      scale: 7,
      questions: [
        'Wie produktiv sind Sie gerade im Vergleich zu sonst?',
        'Wie gut nutzen Sie gerade Ihre Zeit?',
        'Ich fühle mich gerade gestresst',
        'Ich fühle mich gerade überfordert',
        'Ich fühle mich gerade gut'
      ],
      responseOptions: [
        ['gar nicht', 'etwas', 'sehr'],
        ['gar nicht', 'etwas', 'sehr'],
        ['gar nicht', 'etwas', 'sehr'],
        ['gar nicht', 'etwas', 'sehr'],
        ['gar nicht', 'etwas', 'sehr']
      ],
      intervalInMs: 1000 * 60 * 60 * 3, // 3 hours
      samplingRandomization: 0.1 // 10% randomization, so the interval will be between 2.7 and 3.3 hours
    }
  }
};
export default studyConfig;
