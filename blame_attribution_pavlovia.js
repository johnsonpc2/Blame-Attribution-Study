// ============================================================
// PAVLOVIA INIT / FINISH
// ============================================================
const pavlovia_init = { type: jsPsychPavlovia, command: "init" };
const pavlovia_finish = { type: jsPsychPavlovia, command: "finish" };

const jsPsych = initJsPsych({
  minimum_valid_rt: 200,
  on_finish: function() {
    // Flatten demographics responses onto their trial data
    ['demographics_age','demographics_gender','demographics_gender_other','demographics_race','demographics_english'].forEach(phase => {
      var d = jsPsych.data.get().filter({phase: phase}).values();
      if (d.length > 0 && d[0].response) {
        Object.keys(d[0].response).forEach(key => { d[0][key] = d[0].response[key]; });
      }
    });
  }
});

// Participant ID (from SONA/Prolific URL param, or fallback prompt)
const urlParams = new URLSearchParams(window.location.search);
const participantID = urlParams.get('participant') || 'unknown';
jsPsych.data.addProperties({ sona_id: participantID });

const timeline = [];

// ============================================================
// CONSENT FORM
// ============================================================
const consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 900px; margin: 0 auto; padding: 20px; text-align: left; line-height: 1.6;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px;">INFORMED CONSENT INFORMATION</h1>
      <h2 style="text-align: center; font-size: 22px; margin-bottom: 20px;">FOR RESEARCH PARTICIPATION</h2>

      <p><strong>Study Title:</strong> Perceptions of Responsibility and Blame in Cases of Death</p>
      <p><strong>Principal Investigator:</strong> [Your Name]</p>
      <p><strong>Faculty Advisor:</strong> [Advisor Name]</p>
      <p style="margin-bottom:20px;"><strong>IRB Study Number:</strong> [Study Number]</p>

      <p>You are invited to take part in a research study examining how people attribute responsibility and blame when a person dies under different circumstances.</p>

      <h3>Why are you doing this study?</h3>
      <p>We are interested in how people assign responsibility, blame, and perceived control to different individuals (e.g., the deceased, family members, medical or other professionals) across a variety of hypothetical scenarios.</p>

      <h3>What will I do if I choose to be in this study?</h3>
      <p>You will read eight brief hypothetical scenarios describing a person's death under different circumstances. After each scenario, you will answer a series of questions about who you believe is responsible, whether you would consider the death a suicide, and how much control, responsibility, and blame you assign. One question asks you to briefly explain your reasoning in your own words.</p>

      <h3>Content Warning</h3>
      <p style="background-color:#fff3cd; border-left:4px solid #ffc107; padding:12px;">
        <strong>Please be advised that this study includes descriptions of death, drug overdose, and suicide.</strong>
        Some participants may find this content distressing. Participation is completely voluntary, and you may stop
        at any time without penalty. If you are currently experiencing thoughts of suicide or self-harm, please do
        not continue with this study — instead, contact the 988 Suicide & Crisis Lifeline (call or text 988,
        available 24/7 in the US) or your local emergency services.
      </p>

      <h3>For how long will I participate?</h3>
      <p>This study takes approximately 20–30 minutes to complete.</p>

      <h3>Are there any costs I should be aware of?</h3>
      <p>Participation is not expected to incur any cost to you.</p>

      <h3>What are the possible risks or discomforts?</h3>
      <p>As described above, some scenarios involve sensitive topics such as overdose and suicide, which some participants may find upsetting. You may withdraw from the study at any time without consequence.</p>

      <h3>What are the possible benefits?</h3>
      <p>There are no direct personal benefits. Your responses may help researchers better understand how people reason about responsibility and blame, which has implications for public health messaging and mental health research.</p>

      <h3>Will I receive compensation?</h3>
      <p>[Describe SONA credit / payment / Prolific compensation as applicable.]</p>

      <h3>How will you protect the information you collect about me?</h3>
      <p>Your responses are collected anonymously. No directly identifying information is collected. Data will be stored on secure, password-protected systems accessible only to the research team.</p>

      <h3>What are my rights as a research participant?</h3>
      <p>Participation is voluntary. You may skip any question or stop the study at any time without penalty.</p>

      <h3>Who can I contact with questions?</h3>
      <p>[Investigator name/email], [Advisor name/email]. For questions about your rights as a participant, contact your Institutional Review Board.</p>

      <div style="background-color:#f9f9f9; border:2px solid #4CAF50; border-radius:5px; padding:20px; margin-top:20px;">
        <p><strong>To save a copy of this consent form, press Ctrl+P (Windows/Linux) or Cmd+P (Mac) and select "Save as PDF".</strong></p>
        <p style="margin-bottom:0;"><strong>By clicking "I Agree" below, I confirm that I am 18 years of age or older, have read and understood this form, and agree to participate.</strong></p>
      </div>
    </div>
  `,
  choices: ['I Agree', 'I Do Not Agree'],
  data: { phase: 'informed_consent' },
  on_finish: (data) => { data.consented = data.response === 0; }
};

const consent_check = {
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>You have declined to participate in this study. Thank you for your time.<br><br>Redirecting...</p>',
    choices: [],
    trial_duration: 1500,
    on_finish: function() { window.location.href = 'https://albany.sona-systems.com/'; }
  }],
  conditional_function: function() {
    return jsPsych.data.get().last(1).values()[0].response === 1;
  }
};

timeline.push(pavlovia_init);
timeline.push(consent);
timeline.push(consent_check);

// ============================================================
// INSTRUCTIONS
// ============================================================
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `<h2>Instructions</h2>
    <p style="text-align:left">You will read several scenarios, one at a time.</p>
    <p style="text-align:left">After reading each scenario, click "Finished Reading".</p>
    <p style="text-align:left">You will then answer seven questions about the scenario, based only on the information provided.</p>
    <p style="text-align:left">There will be eight scenarios in total.</p>`,
  choices: ["Begin"],
  data: { phase: 'task_instructions' }
});

// ============================================================
// DEMOGRAPHICS
// ============================================================
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size:3vw">Demographic Questionnaire</p>',
  choices: 'NO_KEYS',
  trial_duration: 1500,
  data: { phase: 'intermediate_slide_demo' }
});

const demographics_english = {
  type: jsPsychSurveyMultiChoice,
  questions: [{
    prompt: '<p style="font-size:1.5vw">Which of the following best describes your agreement with this statement: <br><br>I can fluently read and communicate in English.</p>',
    name: 'english',
    options: ["Strongly disagree","Disagree","Neither agree nor disagree","Agree","Strongly agree"],
    required: true
  }],
  data: { phase: 'demographics_english' }
};

const demographics_age = {
  type: jsPsychSurveyText,
  questions: [{ prompt: '<p style="font-size:1.5vw">Please enter your age (e.g., "24")</p>', name: 'age', required: true }],
  data: { phase: 'demographics_age' }
};

const demographics_gender = {
  type: jsPsychSurveyMultiSelect,
  questions: [{
    prompt: '<p style="font-size:1.5vw">Which of the following gender identities best describes you? Select all that apply.</p>',
    name: 'gender',
    options: ["Woman","Man","Transgender Woman","Transgender Man","Non-binary/gender non-conforming","Other","Prefer not to say"],
    required: true, vertical: true
  }],
  data: { phase: 'demographics_gender' }
};

const demographics_gender_other = {
  type: jsPsychSurveyText,
  questions: [{ prompt: '<p style="font-size:1.5vw">If you selected "Other", please specify (otherwise answer "N/A")</p>', name: 'gender_other', required: true }],
  data: { phase: 'demographics_gender_other' }
};

const demographics_race = {
  type: jsPsychSurveyMultiChoice,
  questions: [{
    prompt: '<p style="font-size:1.5vw">Which of the following best describes you?</p>',
    name: 'race',
    options: ["Asian or Pacific Islander","Black or African American","Hispanic or Latino","Indigenous or Native American","White or Caucasian","Multiracial"],
    required: true, vertical: true
  }],
  data: { phase: 'demographics_race' }
};

timeline.push(demographics_english);

// Language eligibility check
timeline.push({
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p style="font-size:1.5vw">This study requires English fluency. You will not receive credit for this session.<br><br>Redirecting...</p>',
    choices: [],
    trial_duration: 4000,
    on_finish: function() { window.location.href = 'https://albany.sona-systems.com/'; }
  }],
  conditional_function: function() {
    var r = jsPsych.data.get().filter({phase:'demographics_english'}).last(1).values()[0].response.english;
    return r !== "Agree" && r !== "Strongly agree";
  }
});

timeline.push(demographics_age);

// Age eligibility check
timeline.push({
  timeline: [{
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p style="font-size:1.5vw">This study is restricted to participants 18 or older. You will not receive credit for this session.<br><br>Redirecting...</p>',
    choices: [],
    trial_duration: 4000,
    on_finish: function() { window.location.href = 'https://albany.sona-systems.com/'; }
  }],
  conditional_function: function() {
    var age = parseInt(jsPsych.data.get().filter({phase:'demographics_age'}).last(1).values()[0].response.age);
    return age < 18;
  }
});

timeline.push(demographics_gender);
timeline.push({
  timeline: [demographics_gender_other],
  conditional_function: function() {
    var d = jsPsych.data.get().filter({phase:'demographics_gender'}).last(1).values()[0];
    return d.response.gender && d.response.gender.includes('Other');
  }
});
timeline.push(demographics_race);

// ============================================================
// SCENARIOS
// ============================================================
const scenarios = [
  { number:1, condition:"Age_Younger",
    text:"A 13 year old is prescribed a strong painkiller. One month later, the kid dies from an overdose.",
    parties:["The Individual","The Parents","The Doctor"] },
  { number:2, condition:"Age_Older",
    text:"An 18 year old is prescribed a strong painkiller. One month later, the person dies from an overdose.",
    parties:["The Individual","The Parents","The Doctor"] },
  { number:3, condition:"Addiction_Resupply",
    text:"A person who is struggling with a drug addiction meets with a group of friends who are aware of their drug use. The person tells their friends that they intend to resupply their drugs. Later that night, the person dies from an overdose.",
    parties:["The Individual","The Dealer","The Friends"] },
  { number:4, condition:"Addiction_First_Time",
    text:"A person meets with a group of friends who are using drugs. The person tells their friends that they have never used drugs before but decides to purchase drugs from a dealer. Later that night, the person dies from an overdose.",
    parties:["The Individual","The Dealer","The Friends"] },
  { number:5, condition:"Treatment_Received",
    text:"A young person tells their parents that they have been having thoughts about hurting themselves and asks to see a therapist. Their parents agree, and the person is referred to a healthcare provider who evaluates them and helps arrange treatment. The person begins therapy. Six months later, the person is found dead in their bedroom unexpectedly.",
    parties:["The Individual","The Parents","The Therapist"] },
  { number:6, condition:"Treatment_Denied",
    text:"A young person tells their parents that they have been having thoughts about hurting themselves and asks to see a therapist. Their parents disagree and the person does not begin therapy. The healthcare provider who had previously been contacted by the family does not provide any additional follow-up. Six months later, the person is found dead in their bedroom unexpectedly.",
    parties:["The Individual","The Parents","The Healthcare Professional"] },
  { number:7, condition:"Advice_Friend",
    text:"A person is experiencing a difficult situation and is unsure about what to do. They tell a close friend that they have been having thoughts about hurting themselves and ask for advice. The friend listens and provides advice but does not suggest that the person seek professional or emergency help. The person later uses a chatbot to seek additional advice, but does not receive any further recommendation to seek professional or emergency help. Later that night, the person is found dead in their bedroom unexpectedly.",
    parties:["The Individual","The Friend","The Chatbot"] },
  { number:8, condition:"Advice_Chatbot",
    text:"A person is experiencing a difficult situation and is unsure about what to do. They tell a close friend that they have been having thoughts about hurting themselves and ask for advice. The friend listens and encourages the person to seek professional or emergency help. The person later uses a chatbot to seek additional advice. The chatbot responds but does not suggest that the person seek professional or emergency help. Later that night, the person is found dead in their bedroom unexpectedly.",
    parties:["The Individual","The Friend","The Chatbot"] }
];

jsPsych.randomization.shuffle(scenarios);

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size:3vw">Scenario Task</p>',
  choices: 'NO_KEYS',
  trial_duration: 1500,
  data: { phase: 'intermediate_slide_scenarios' }
});

scenarios.forEach(scenario => {

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>Please read the following scenario carefully.</p>
                <p style="font-size:20px; text-align:left">${scenario.text}</p>`,
    choices: ["Finished Reading"],
    data: { scenario_number: scenario.number, condition: scenario.condition, scenario_text: scenario.text, trial_part: "reading" },
    on_finish: (data) => { data.scenario_reading_rt = data.rt; }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Which party is most responsible for this death?</p>",
    choices: scenario.parties,
    data: { scenario_number: scenario.number, condition: scenario.condition, trial_part: "q1" },
    on_finish: (data) => { data.q1_response = scenario.parties[data.response]; data.q1_rt = data.rt; }
  });

  const rankHtml = scenario.parties.map((p,i) =>
    `<p>${p}: <select name="rank_${i}" required>
      <option value="">--</option>
      ${scenario.parties.map((_,r)=>`<option value="${r+1}">${r+1}</option>`).join("")}
    </select></p>`
  ).join("");

  timeline.push({
    type: jsPsychSurveyHtmlForm,
    preamble: "<p>Rank the parties from most (1) to least responsible.</p>",
    html: rankHtml,
    data: { scenario_number: scenario.number, condition: scenario.condition, trial_part: "q2" },
    on_finish: (data) => {
      const resp = data.response;
      const ranks = scenario.parties.map((p,i)=>({party:p, rank: parseInt(resp["rank_"+i])}));
      ranks.sort((a,b)=>a.rank-b.rank);
      data.q2_response = ranks.map(r=>r.party).join(" > ");
      data.q2_rt = data.rt;
    }
  });

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Would you consider this death a suicide?</p>",
    choices: ["Yes","No"],
    data: { scenario_number: scenario.number, condition: scenario.condition, trial_part: "q3" },
    on_finish: (data) => { data.q3_response = ["Yes","No"][data.response]; data.q3_rt = data.rt; }
  });

  timeline.push({
    type: jsPsychSurveyText,
    questions: [{ prompt: "Please explain why yes or why no.", rows: 5, columns: 60, required: true }],
    data: { scenario_number: scenario.number, condition: scenario.condition, trial_part: "q4" },
    on_finish: (data) => { data.q4_response = data.response.Q0; data.q4_rt = data.rt; }
  });

  [
    { key:"q5", q:"How much control did the person have over the circumstances that led to their death?", left:"1 = None at all", right:"5 = A great deal" },
    { key:"q6", q:"How responsible was the person for their own death?", left:"1 = Not at all responsible", right:"5 = Extremely responsible" },
    { key:"q7", q:"How much blame does the person deserve for their own death?", left:"1 = No blame at all", right:"5 = A great deal of blame" }
  ].forEach(item => {
    timeline.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>${item.q}</p>
                  <p style="display:flex; justify-content:space-between; max-width:400px; margin:auto;">
                  <span>${item.left}</span><span>${item.right}</span></p>`,
      choices: ["1","2","3","4","5"],
      data: { scenario_number: scenario.number, condition: scenario.condition, trial_part: item.key },
      on_finish: (data) => { data[item.key+"_response"] = String(data.response+1); data[item.key+"_rt"] = data.rt; }
    });
  });

});

// ============================================================
// DEBRIEFING
// ============================================================
const debriefing = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 900px; margin: 0 auto; padding: 20px; text-align: left; line-height: 1.6;">
      <h1 style="text-align:center; font-size:24px;">Study Debriefing</h1>
      <div style="text-align:center; font-size:18px; color:#555; margin-bottom:20px; font-style:italic;">
        Perceptions of Responsibility and Blame in Cases of Death
      </div>

      <div style="background-color:#e3f2fd; border-left:4px solid #2196F3; padding:20px; margin:20px 0;">
        <h2 style="margin-top:0; color:#1976d2; font-size:20px;">Thank You for Participating!</h2>
        <p style="margin-bottom:0;">Your responses help us understand how people reason about responsibility and blame in difficult, real-world-relevant situations.</p>
      </div>

      <h2 style="border-bottom:2px solid #e0e0e0; padding-bottom:8px;">Study Purpose</h2>
      <p>This study examined how factors such as age, addiction history, access to treatment, and the source of advice (friend vs. chatbot) shape people's judgments of responsibility, blame, and whether a death is perceived as a suicide.</p>

      <h2 style="border-bottom:2px solid #e0e0e0; padding-bottom:8px;">Why the Scenarios Varied</h2>
      <p>Each scenario you read varied one key factor (e.g., the person's age, whether they had used drugs before, whether they received mental health treatment, or whether advice came from a friend or a chatbot). By comparing responses across these variations, we can identify which factors most strongly influence blame attribution.</p>

      <h2 style="border-bottom:2px solid #e0e0e0; padding-bottom:8px;">A Note on the Content</h2>
      <p>We recognize that the scenarios you read touched on sensitive topics, including overdose and suicide. If this content brought up difficult feelings, please consider reaching out to a trusted person or professional.</p>
      <div style="background-color:#fff3cd; border-left:4px solid #ffc107; padding:15px; margin:15px 0;">
        <strong>988 Suicide & Crisis Lifeline</strong> — call or text 988 (available 24/7 in the US)<br>
        <strong>Crisis Text Line</strong> — text HOME to 741741
      </div>

      <h2 style="border-bottom:2px solid #e0e0e0; padding-bottom:8px;">Confidentiality</h2>
      <p>Your responses are anonymous and cannot be traced back to you. Data will be stored securely and accessible only to the research team.</p>

      <h2 style="border-bottom:2px solid #e0e0e0; padding-bottom:8px;">Questions or Concerns?</h2>
      <div style="background-color:#f0f0f0; padding:15px; border-left:4px solid #2196F3; margin:20px 0;">
        <p>Contact: [Investigator Name/Email], [Advisor Name/Email]</p>
        <p style="margin-bottom:0;">For questions about your rights as a participant, contact your Institutional Review Board.</p>
      </div>

      <div style="background-color:#fff3cd; border:2px solid #ffc107; border-radius:5px; padding:20px; margin-top:20px;">
        <p style="color:#856404; margin-bottom:0;"><strong>Click "Complete Study" below to finish and receive credit.</strong></p>
      </div>
    </div>
  `,
  choices: ['Complete Study'],
  data: { phase: 'debriefing' }
};

timeline.push(debriefing);
timeline.push(pavlovia_finish);

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size:2vw">Saving your data and granting credit...</p>',
  choices: 'NO_KEYS',
  trial_duration: 2000,
  on_finish: function() {
    const pid = jsPsych.data.get().values()[0].sona_id;
    setTimeout(function() {
      window.location.href = `https://albany.sona-systems.com/webstudy_credit.aspx?experiment_id=XXXX&credit_token=XXXX&survey_code=${pid}`;
    }, 500);
  }
});

jsPsych.run(timeline);
