import { StudyConfiguration } from './StudyConfiguration';

const studyConfig: StudyConfiguration = {
  name: 'SWeLL - Student Wellbeing and Learning on Laptops',
  shortDescription: 'The aim of the study is to understand how students from different fields of study use laptops and tablets for their studies, what impact this has on their well-being, and how digital learning processes can be optimized. A detailed description of the study can be found <a href="https://mydata-lab.uzh.ch/de/studien/swell.html" target=_blank">here</a>.',
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
      scale: 5,
      questions: [
        'How productive are you right now compared to usual?',
        'How well are you currently spending your time?',
        'I\'m feeling optimistic about the future', 
        'I\'m feeling useful', 
        'I\'m feeling relaxed', 
        'I\'m dealing with problems well', 
        'I\'m thinking clearly', 
        'I\'m feeling close to other people', 
        'I\'m able to make up my own mind about things'
      ],
      responseOptions: [
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very'],
        ['not at all', 'somewhat', 'very']
      ],
      intervalInMs: 1000 * 60 * 60 * 3, // 3 hours
      samplingRandomization: 0.1 // 10% randomization, so the interval will be between 2.7 and 3.3 hours
    }
  }
};
export default studyConfig;
