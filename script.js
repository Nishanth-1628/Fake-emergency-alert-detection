/**
 * ============================================================================
 * SENTINEL-ALERT // AI Fake Emergency Alert Detector
 * Pure Vanilla JavaScript (ES6+) - Zero External Dependencies
 * ============================================================================
 */

'use strict';

/* ============================================================================
   1. GLOBAL STATE & CONFIGURATION
   ============================================================================ */
const STATE = {
  theme: localStorage.getItem('sentinel_theme') || 'dark',
  inferenceMode: localStorage.getItem('sentinel_engine') || 'heuristic',
  apiKey: sessionStorage.getItem('sentinel_api_key') || '',
  activeSampleIndex: null,
  currentAnalysis: null,
  history: [],
  isRecording: false,
  recognitionInstance: null,
  isSpeaking: false
};

// Built-in Demonstration Test Samples
const SAMPLE_ALERTS = [
  {
    id: 1,
    title: "Earthquake Rumor",
    text: "URGENT!!! Massive earthquake will definitely hit Chennai tonight at 10 PM. Government has confirmed this. Forward this message to everyone immediately!!!",
    source: "WhatsApp Forward",
    location: "Chennai, India",
    time: "Tonight 10:00 PM"
  },
  {
    id: 2,
    title: "Mobile Network Shutdown",
    text: "Breaking news! Police have confirmed that all mobile networks and internet services will be shut down tomorrow across the state. Share this message with your friends before it's too late.",
    source: "Viral Social Post",
    location: "Statewide",
    time: "Tomorrow Morning"
  },
  {
    id: 3,
    title: "Rainfall Advisory",
    text: "Authorities are advising residents in flood-prone areas to remain alert due to heavy rainfall forecasted over the weekend. Keep emergency kits ready.",
    source: "Community SMS",
    location: "Coastal District",
    time: "This Weekend"
  },
  {
    id: 4,
    title: "Official Flood Warning",
    text: "District disaster authorities have issued an official flood warning for low-lying sectors along the river basin. Residents are advised to follow evacuation instructions from local authorities. Official Bulletin #DRM-2026-88. Verify at https://ndma.gov.in",
    source: "State Disaster Management Portal",
    location: "River Basin District",
    time: "Issued 08:30 AM"
  },
  {
    id: 5,
    title: "Viral Terror Hoax",
    text: "100% CONFIRMED!!! A dangerous explosion attack is going to happen tomorrow in shopping malls. Do not ignore this alert! Send it to 20 people right now or you will be responsible!",
    source: "Unknown Chain SMS",
    location: "Metro Cities",
    time: "Tomorrow"
  }
];

/* ============================================================================
   2. DETECTION DICTIONARIES & LINGUISTIC PATTERNS
   ============================================================================ */
const DICTIONARIES = {
  // Vector 1: Urgency & Panic Drivers
  urgency: [
    { phrase: 'urgent', weight: 15, tip: 'High artificial urgency trigger' },
    { phrase: 'breaking news', weight: 12, tip: 'Sensationalist broadcast claim' },
    { phrase: 'breaking', weight: 10, tip: 'Sensationalist broadcast claim' },
    { phrase: 'immediately', weight: 14, tip: 'Pressure to act without verification' },
    { phrase: 'share now', weight: 16, tip: 'Viral distribution pressure' },
    { phrase: 'share this immediately', weight: 18, tip: 'Viral distribution pressure' },
    { phrase: 'forward to everyone', weight: 20, tip: 'Social contagion manipulation' },
    { phrase: 'do not ignore', weight: 16, tip: 'Psychological compliance coercion' },
    { phrase: 'dont ignore', weight: 16, tip: 'Psychological compliance coercion' },
    { phrase: 'act now', weight: 12, tip: 'High urgency call to action' },
    { phrase: 'right now', weight: 12, tip: 'Immediate action driver' },
    { phrase: 'before it is too late', weight: 16, tip: 'Artificial time-scarcity panic' },
    { phrase: 'before its too late', weight: 16, tip: 'Artificial time-scarcity panic' },
    { phrase: 'asap', weight: 10, tip: 'Urgency acronym' },
    { phrase: 'critical alert', weight: 10, tip: 'Alarmist label' },
    { phrase: 'red alert', weight: 12, tip: 'High panic indicator' },
    { phrase: 'warning!!!', weight: 15, tip: 'Sensationalist punctuation' }
  ],

  // Vector 2: Fear-Inducing & Disaster Terms
  fear: [
    { phrase: 'massive earthquake', weight: 18, tip: 'Catastrophic disaster claim (Note: Earthquakes cannot be predicted by hour)' },
    { phrase: 'earthquake', weight: 10, tip: 'Seismic disaster reference' },
    { phrase: 'explosion', weight: 16, tip: 'High-fatality threat term' },
    { phrase: 'blast', weight: 14, tip: 'Violent hazard term' },
    { phrase: 'bomb', weight: 18, tip: 'Severe national security threat' },
    { phrase: 'attack', weight: 14, tip: 'Violent threat keyword' },
    { phrase: 'terror attack', weight: 20, tip: 'High-panic national security claim' },
    { phrase: 'death', weight: 12, tip: 'Casualty-focused language' },
    { phrase: 'deadly', weight: 12, tip: 'High-severity fear keyword' },
    { phrase: 'casualties', weight: 12, tip: 'Casualty claim' },
    { phrase: 'disaster', weight: 10, tip: 'Disaster terminology' },
    { phrase: 'catastrophe', weight: 14, tip: 'High-temperature emotional noun' },
    { phrase: 'panic', weight: 10, tip: 'Psychological distress keyword' },
    { phrase: 'chemical leak', weight: 16, tip: 'Hazardous material emergency claim' },
    { phrase: 'toxic gas', weight: 16, tip: 'Chemical hazard trigger' },
    { phrase: 'tsunami', weight: 14, tip: 'Coastal inundation emergency' },
    { phrase: 'cyclone', weight: 10, tip: 'Severe storm keyword' },
    { phrase: 'flood', weight: 8, tip: 'Hydrological hazard keyword' },
    { phrase: 'destroy', weight: 12, tip: 'Extreme damage claim' }
  ],

  // Vector 3: Vague or Unverified Authority Claims
  unverifiedAuthority: [
    { phrase: 'government has confirmed', weight: 20, tip: 'Unsubstantiated governmental attribution' },
    { phrase: 'government confirmed', weight: 20, tip: 'Unsubstantiated governmental attribution' },
    { phrase: 'police have confirmed', weight: 18, tip: 'Unverified law enforcement attribution' },
    { phrase: 'police confirmed', weight: 18, tip: 'Unverified law enforcement attribution' },
    { phrase: 'official sources say', weight: 16, tip: 'Anonymous authority citation' },
    { phrase: 'scientists confirmed', weight: 16, tip: 'Vague scientific attribution' },
    { phrase: 'nasa confirmed', weight: 18, tip: 'Spoofed scientific agency claim' },
    { phrase: 'who confirmed', weight: 18, tip: 'Spoofed health agency claim' },
    { phrase: 'secret sources', weight: 22, tip: 'Conspiracy / unverifiable sourcing' },
    { phrase: 'confidential notice', weight: 16, tip: 'Manufactured leaked credibility' },
    { phrase: 'ministry warned', weight: 16, tip: 'Generic ministerial appeal' },
    { phrase: 'high command', weight: 16, tip: 'Vague institutional appeal' }
  ],

  // Vector 4: Excessive Certainty / Absolutism
  excessiveCertainty: [
    { phrase: '100% confirmed', weight: 22, tip: 'Non-probabilistic extreme certainty' },
    { phrase: '100% real', weight: 20, tip: 'Artificial authenticity emphasis' },
    { phrase: 'definitely hit', weight: 18, tip: 'Unscientific exact future disaster prediction' },
    { phrase: 'definitely', weight: 14, tip: 'Absolute claim without scientific margin' },
    { phrase: 'guaranteed', weight: 16, tip: 'Absolutist assertion' },
    { phrase: 'will happen', weight: 12, tip: 'Deterministic future crisis prediction' },
    { phrase: 'everyone must', weight: 12, tip: 'Sweeping command imperative' },
    { phrase: 'certainly', weight: 12, tip: 'Absolutist claim' },
    { phrase: 'without a doubt', weight: 16, tip: 'Extreme certainty assertion' }
  ],

  // Vector 5: Viral Forwarding & Contagion Pressure
  forwardingPatterns: [
    { phrase: 'forward this message', weight: 20, tip: 'Explicit viral forwarding command' },
    { phrase: 'forward this to everyone', weight: 22, tip: 'Broadcast chain forwarding command' },
    { phrase: 'forward this', weight: 16, tip: 'Chain message forwarding request' },
    { phrase: 'share this message', weight: 18, tip: 'Social amplification demand' },
    { phrase: 'share this with your friends', weight: 16, tip: 'Peer-to-peer contagion appeal' },
    { phrase: 'share this', weight: 14, tip: 'Amplification request' },
    { phrase: 'send to everyone', weight: 20, tip: 'Mass spamming trigger' },
    { phrase: 'send to 20 people', weight: 25, tip: 'Classic pyramid chain hoax formula' },
    { phrase: 'send it to', weight: 14, tip: 'Chain propagation demand' },
    { phrase: 'send this to all', weight: 20, tip: 'Mass forwarding demand' },
    { phrase: 'dont delete this', weight: 18, tip: 'Retention coercion' },
    { phrase: 'do not delete', weight: 18, tip: 'Retention coercion' },
    { phrase: 'pass this on', weight: 14, tip: 'Chain message phrase' }
  ],

  // Credible Official Domains (Reduces risk when present)
  credibleDomains: [
    'gov.in', 'ndma.gov.in', 'imd.gov.in', 'pib.gov.in', 'fema.gov', 'usgs.gov',
    'noaa.gov', 'weather.gov', 'who.int', 'un.org', 'redcross.org', 'gov.uk'
  ],

  // Suspicious URL Shorteners / TLDs
  suspiciousLinkPatterns: [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'ow.ly',
    '.xyz', '.top', '.tk', '.cc', '.buzz'
  ]
};

/* ============================================================================
   3. CORE NLP & HEURISTIC DETECTION ENGINE
   ============================================================================ */

/**
 * Main detection controller - analyzes an emergency message and generates
 * risk score, classification, rationale, highlights, and safety recommendations.
 */
function analyzeAlert(text, metadata = {}) {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Initialize Detection Breakdown Accumulators
  const findings = {
    urgency: { score: 0, matches: [] },
    fear: { score: 0, matches: [] },
    authority: { score: 0, matches: [] },
    certainty: { score: 0, matches: [] },
    forwarding: { score: 0, matches: [] },
    formatting: { score: 0, matches: [], details: [] }
  };

  const highlights = []; // For rendering highlighted tokens
  const rationaleList = []; // For explainable AI section

  // 1. Scan Urgency Indicators
  DICTIONARIES.urgency.forEach(item => {
    const regex = new RegExp(`\\b${escapeRegExp(item.phrase)}`, 'gi');
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      findings.urgency.score += item.weight;
      findings.urgency.matches.push(match[0]);
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category: 'urgency',
        text: match[0],
        tip: item.tip
      });
    }
  });

  // 2. Scan Fear & Disaster Triggers
  DICTIONARIES.fear.forEach(item => {
    const regex = new RegExp(`\\b${escapeRegExp(item.phrase)}`, 'gi');
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      findings.fear.score += item.weight;
      findings.fear.matches.push(match[0]);
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category: 'fear',
        text: match[0],
        tip: item.tip
      });
    }
  });

  // 3. Scan Unverified Authority Claims
  DICTIONARIES.unverifiedAuthority.forEach(item => {
    const regex = new RegExp(escapeRegExp(item.phrase), 'gi');
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      findings.authority.score += item.weight;
      findings.authority.matches.push(match[0]);
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category: 'authority',
        text: match[0],
        tip: item.tip
      });
    }
  });

  // 4. Scan Excessive Certainty / Absolutism
  DICTIONARIES.excessiveCertainty.forEach(item => {
    const regex = new RegExp(escapeRegExp(item.phrase), 'gi');
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      findings.certainty.score += item.weight;
      findings.certainty.matches.push(match[0]);
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category: 'authority',
        text: match[0],
        tip: item.tip
      });
    }
  });

  // 5. Scan Viral Forwarding / Manipulation
  DICTIONARIES.forwardingPatterns.forEach(item => {
    const regex = new RegExp(escapeRegExp(item.phrase), 'gi');
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      findings.forwarding.score += item.weight;
      findings.forwarding.matches.push(match[0]);
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category: 'forwarding',
        text: match[0],
        tip: item.tip
      });
    }
  });

  // 6. Formatting & Anomaly Detection
  // 6a. Caps Ratio
  const lettersOnly = cleanText.replace(/[^a-zA-Z]/g, '');
  const upperLetters = cleanText.replace(/[^A-Z]/g, '');
  let capsRatio = 0;
  if (lettersOnly.length > 8) {
    capsRatio = upperLetters.length / lettersOnly.length;
    if (capsRatio > 0.35) {
      const capsWeight = Math.min(25, Math.round(capsRatio * 30));
      findings.formatting.score += capsWeight;
      findings.formatting.details.push(`Excessive capitalization (${Math.round(capsRatio * 100)}% UPPERCASE letters). Used to simulate shouting or panic.`);
    }
  }

  // 6b. Exclamation / Punctuation Spam (e.g. !!!, ???, !?!?)
  const exclMatches = cleanText.match(/!{2,}|\?{2,}|(!\?|\?!)+/g);
  if (exclMatches) {
    const puncScore = Math.min(20, exclMatches.length * 8);
    findings.formatting.score += puncScore;
    findings.formatting.details.push(`Repeated exclamation/question punctuation (${exclMatches.length} clusters flagged).`);
    
    // Highlight punctuation clusters
    const puncRegex = /!{2,}|\?{2,}|(!\?|\?!)+/g;
    let pMatch;
    while ((pMatch = puncRegex.exec(cleanText)) !== null) {
      highlights.push({
        start: pMatch.index,
        end: pMatch.index + pMatch[0].length,
        category: 'format',
        text: pMatch[0],
        tip: 'Excessive punctuation cluster'
      });
    }
  }

  // 6c. Suspicious Shortened URLs or Raw IP Addresses
  DICTIONARIES.suspiciousLinkPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      findings.formatting.score += 20;
      findings.formatting.details.push(`Contains suspicious or shortened link domain (${pattern}). Common in phishing and crisis clickbait.`);
    }
  });

  // 6d. Scientific Impossibility Flag: Exact future earthquake hour prediction
  const isEarthquakePrediction = /earthquake/i.test(cleanText) && (/(tonight|tomorrow|\d{1,2}\s*(am|pm)|\d{1,2}:\d{2})/i.test(cleanText));
  if (isEarthquakePrediction) {
    findings.certainty.score += 25;
    rationaleList.push({
      icon: '🚨',
      vector: 'Scientific Anomaly',
      text: 'Scientific Impossibility: Earthquakes cannot be predicted for specific future hours or dates by seismologists. Any claim stating an earthquake "will hit at 10 PM" is a proven falsehood.'
    });
  }

  // 7. Credibility Mitigation & Authentic Markers
  let credibilityMitigation = 0;
  let hasOfficialUrl = false;
  let hasBulletinCode = false;

  DICTIONARIES.credibleDomains.forEach(domain => {
    if (lowerText.includes(domain)) {
      credibilityMitigation += 25;
      hasOfficialUrl = true;
    }
  });

  if (/bulletin\s*#|reference:\s*[a-z0-9-]+|advisory\s*id/i.test(cleanText)) {
    credibilityMitigation += 15;
    hasBulletinCode = true;
  }

  // Source metadata bonus/penalty
  if (metadata.source) {
    const srcLower = metadata.source.toLowerCase();
    if (srcLower.includes('official') || srcLower.includes('government') || srcLower.includes('ndma') || srcLower.includes('portal')) {
      credibilityMitigation += 10;
    } else if (srcLower.includes('whatsapp') || srcLower.includes('forward') || srcLower.includes('viral') || srcLower.includes('unknown')) {
      findings.forwarding.score += 10;
    }
  }

  // 8. Normalization & Weighted Risk Calculation
  const urgencyNorm = Math.min(100, findings.urgency.score * 2.2);
  const fearNorm = Math.min(100, findings.fear.score * 2.0);
  const authorityNorm = Math.min(100, findings.authority.score * 2.5 + findings.certainty.score * 1.5);
  const forwardingNorm = Math.min(100, findings.forwarding.score * 2.5);
  const formatNorm = Math.min(100, findings.formatting.score * 2.2);

  // Composite Weighted Sum
  let rawScore = (
    (urgencyNorm * 0.22) +
    (fearNorm * 0.18) +
    (authorityNorm * 0.24) +
    (forwardingNorm * 0.22) +
    (formatNorm * 0.14)
  );

  // Apply credibility offsets
  rawScore = Math.max(0, rawScore - credibilityMitigation);
  const finalScore = Math.min(100, Math.round(rawScore));

  // Determine Risk Category & Classification Tier
  let riskLevel = 'LOW';
  let classification = 'Likely Trustworthy';
  let bannerClass = 'low';

  if (finalScore >= 81) {
    riskLevel = 'CRITICAL';
    classification = 'Highly Suspicious';
    bannerClass = 'critical';
  } else if (finalScore >= 61) {
    riskLevel = 'HIGH';
    classification = 'Likely Misleading';
    bannerClass = 'high';
  } else if (finalScore >= 31) {
    riskLevel = 'MEDIUM';
    classification = 'Needs Verification';
    bannerClass = 'medium';
  } else {
    riskLevel = 'LOW';
    classification = 'Likely Trustworthy';
    bannerClass = 'low';
  }

  // 9. Compute Confidence Rating
  let firedVectorsCount = 0;
  if (findings.urgency.matches.length > 0) firedVectorsCount++;
  if (findings.fear.matches.length > 0) firedVectorsCount++;
  if (findings.authority.matches.length > 0) firedVectorsCount++;
  if (findings.certainty.matches.length > 0) firedVectorsCount++;
  if (findings.forwarding.matches.length > 0) firedVectorsCount++;
  if (findings.formatting.score > 0) firedVectorsCount++;

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  let confidence = 65;

  if (wordCount >= 10) confidence += 10;
  if (wordCount >= 20) confidence += 10;
  if (firedVectorsCount >= 3) confidence += 10;
  if (firedVectorsCount >= 4) confidence += 5;
  if (hasOfficialUrl) confidence += 4;
  confidence = Math.min(98, Math.max(50, confidence));

  // 10. Synthesize Explainable Diagnostics & Rationale Log
  if (findings.urgency.matches.length > 0) {
    rationaleList.push({
      icon: '⚠️',
      vector: 'Urgency & Pressure',
      text: `Urgency amplification detected: Contains high-pressure phrases like "${uniqueArray(findings.urgency.matches).slice(0, 3).join('", "')}".`
    });
  }

  if (findings.authority.matches.length > 0 || findings.certainty.matches.length > 0) {
    const authTerms = uniqueArray([...findings.authority.matches, ...findings.certainty.matches]);
    rationaleList.push({
      icon: '⚠️',
      vector: 'Unverified Authority & Certainty',
      text: `Vague institutional claims without authentic citation: Found phrases like "${authTerms.slice(0, 3).join('", "')}".`
    });
  }

  if (findings.fear.matches.length > 0) {
    rationaleList.push({
      icon: '⚠️',
      vector: 'Emotional Fear Induction',
      text: `Contains high-fatality or alarming disaster references: "${uniqueArray(findings.fear.matches).slice(0, 3).join('", "')}".`
    });
  }

  if (findings.forwarding.matches.length > 0) {
    rationaleList.push({
      icon: '⚠️',
      vector: 'Virality & Social Contagion',
      text: `Explicit instruction to propagate or forward message: "${uniqueArray(findings.forwarding.matches).slice(0, 3).join('", "')}".`
    });
  }

  findings.formatting.details.forEach(detail => {
    rationaleList.push({
      icon: '⚠️',
      vector: 'Structural Anomaly',
      text: detail
    });
  });

  if (hasOfficialUrl) {
    rationaleList.push({
      icon: '✅',
      vector: 'Credibility Indicator',
      text: 'Verified official public authority domain reference detected.'
    });
  }

  if (hasBulletinCode) {
    rationaleList.push({
      icon: '✅',
      vector: 'Credibility Indicator',
      text: 'Specific administrative disaster bulletin identifier included.'
    });
  }

  if (rationaleList.length === 0) {
    rationaleList.push({
      icon: 'ℹ️',
      vector: 'Neutral Profile',
      text: 'No high-temperature alarmist triggers, chain-forwarding formulas, or spoofed authority patterns were detected.'
    });
  }

  // 11. Contextual Disaster Safety Guidance
  const safetyGuidance = getDisasterSafetyGuidance(cleanText);

  // 12. Recommended Action Formulation
  let recommendedAction = {
    heading: 'Verify Through Official Portals',
    body: 'Exercise caution before acting or forwarding. Consult state disaster management bulletins.',
    icon: 'ℹ️'
  };

  if (finalScore >= 81) {
    recommendedAction = {
      heading: 'HALT FORWARDING IMMEDIATELY',
      body: 'Critical hoax probability. Do not forward this alert to groups or social media. Check official fact-check portals.',
      icon: '⛔'
    };
  } else if (finalScore >= 61) {
    recommendedAction = {
      heading: 'Cross-Check Verified Media',
      body: 'High likelihood of misleading content. Authentic emergency events will be broadcast across all major verified news channels.',
      icon: '⚠️'
    };
  } else if (finalScore >= 31) {
    recommendedAction = {
      heading: 'Verify With Local Authorities',
      body: 'The advisory contains moderate concern. Look for official government press releases before making decisions.',
      icon: '🔍'
    };
  } else {
    recommendedAction = {
      heading: 'Standard Safety Protocol',
      body: 'The message exhibits standard official public safety communication patterns. Follow authorized civil defense directives.',
      icon: '✅'
    };
  }

  return {
    id: `SA-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toLocaleString(),
    originalText: cleanText,
    metadata,
    riskScore: finalScore,
    riskLevel,
    classification,
    bannerClass,
    confidence,
    firedVectorsCount,
    vectorScores: {
      urgency: Math.round(urgencyNorm),
      fear: Math.round(fearNorm),
      authority: Math.round(authorityNorm),
      forwarding: Math.round(forwardingNorm),
      formatting: Math.round(formatNorm)
    },
    highlights: deduplicateHighlights(highlights, cleanText),
    rationale: rationaleList,
    safetyGuidance,
    recommendedAction
  };
}

/**
 * Returns contextual disaster safety protocols based on alert topic
 */
function getDisasterSafetyGuidance(text) {
  const lower = text.toLowerCase();

  if (/earthquake|tremor|seismic/i.test(lower)) {
    return {
      category: 'Seismic / Earthquake Protocol',
      guides: [
        { title: 'Drop, Cover & Hold On', text: 'Get under sturdy furniture immediately. Stay away from glass windows, exterior walls, and overhead lighting.' },
        { title: 'If Outdoors', text: 'Move away from buildings, streetlights, and utility wires. Remain in open areas until shaking stops.' },
        { title: 'Post-Tremor Actions', text: 'Check for gas leaks and structural damage. Expect aftershocks; avoid elevators.' }
      ]
    };
  }

  if (/flood|rainfall|inundation|water logging/i.test(lower)) {
    return {
      category: 'Flood & Severe Weather Protocol',
      guides: [
        { title: 'Seek Higher Ground', text: 'Evacuate low-lying zones immediately if directed by authorities.' },
        { title: 'Turn Around, Don’t Drown', text: 'Never attempt to drive or walk through moving water. 6 inches of water can knock you down.' },
        { title: 'Electrical Safety', text: 'Switch off main electrical breakers if water enters your premises.' }
      ]
    };
  }

  if (/fire|explosion|blast|smoke/i.test(lower)) {
    return {
      category: 'Fire & Explosion Hazard Protocol',
      guides: [
        { title: 'Immediate Evacuation', text: 'Use marked fire exit stairs. Never use elevators during a fire alert.' },
        { title: 'Stay Low Under Smoke', text: 'Crawl below heavy smoke where air is cleaner. Cover mouth with a damp cloth if available.' },
        { title: 'Call Emergency Services', text: 'Dial local fire emergency dispatch immediately once in a safe assembly zone.' }
      ]
    };
  }

  if (/cyclone|hurricane|typhoon|storm/i.test(lower)) {
    return {
      category: 'Severe Cyclone & Storm Protocol',
      guides: [
        { title: 'Indoor Shelter', text: 'Remain in the strongest central room of your residence away from all glass windows.' },
        { title: 'Emergency Supplies', text: 'Keep potable water, non-perishable food, flashlights, and power banks charged.' },
        { title: 'Do Not Venture Out', text: 'Do not go outside during the calm "eye" of the storm; winds will reverse violently.' }
      ]
    };
  }

  if (/chemical|gas leak|toxic|poison/i.test(lower)) {
    return {
      category: 'Hazardous Chemical Protocol',
      guides: [
        { title: 'Upwind Evacuation', text: 'Move upwind and crosswind away from the vapor or gas source.' },
        { title: 'Shelter in Place', text: 'Seal doors and windows with wet towels. Turn off all air conditioning and ventilation systems.' },
        { title: 'Decontamination', text: 'Remove contaminated clothing immediately and rinse eyes/skin with clean water.' }
      ]
    };
  }

  // Default General Public Safety Guidance
  return {
    category: 'General Public Safety Advisory',
    guides: [
      { title: 'Rely on Official Channels', text: 'Tune to national radio, official disaster management websites, or verified police broadcasts.' },
      { title: 'Emergency Communications', text: 'Keep phone lines free for first responders. Use text messaging to notify family.' },
      { title: 'Follow First Responder Orders', text: 'Obey evacuation orders and civil defense instructions without hesitation.' }
    ]
  };
}

/**
 * Merges overlapping text highlight spans and prepares HTML injection
 */
function generateHighlightedHtml(originalText, highlights) {
  if (!highlights || highlights.length === 0) {
    return escapeHtml(originalText);
  }

  highlights.sort((a, b) => a.start - b.start);

  let html = '';
  let currentIndex = 0;

  highlights.forEach(hl => {
    if (hl.start < currentIndex) return;

    if (hl.start > currentIndex) {
      html += escapeHtml(originalText.slice(currentIndex, hl.start));
    }

    const tokenText = originalText.slice(hl.start, hl.end);
    const categoryClass = hl.category || 'urgency';
    const tooltip = escapeHtml(hl.tip || 'Suspicious indicator');

    html += `<span class="hl-token ${categoryClass}" data-tooltip="${tooltip}">${escapeHtml(tokenText)}</span>`;
    currentIndex = hl.end;
  });

  if (currentIndex < originalText.length) {
    html += escapeHtml(originalText.slice(currentIndex));
  }

  return html;
}

function deduplicateHighlights(highlights, text) {
  highlights.sort((a, b) => (a.start - b.start) || (b.end - a.end));
  const result = [];
  let lastEnd = -1;

  highlights.forEach(h => {
    if (h.start >= lastEnd && h.end <= text.length) {
      result.push(h);
      lastEnd = h.end;
    }
  });
  return result;
}

/* ============================================================================
   4. UI RENDERING & USER-FRIENDLY CONTROLLERS
   ============================================================================ */

/**
 * Renders analysis results into the DOM
 */
function renderResults(res) {
  const container = document.getElementById('results-container');
  container.classList.remove('hidden');

  // 1. Result Banner
  const banner = document.getElementById('result-banner');
  banner.className = `result-banner ${res.bannerClass}`;

  document.getElementById('risk-badge').textContent = `${res.riskLevel} RISK // ${res.riskScore}/100`;
  document.getElementById('classification-pill').textContent = res.classification;
  document.getElementById('result-timestamp').textContent = `Analyzed: ${res.timestamp}`;
  document.getElementById('result-id').textContent = `ID: #${res.id}`;

  // 2. User-Friendly Quick Verdict Box
  const verdictIcon = document.getElementById('verdict-icon-big');
  const verdictHeadline = document.getElementById('verdict-headline');
  const verdictSubtext = document.getElementById('verdict-subtext');

  if (res.riskScore >= 81) {
    verdictIcon.textContent = '🛑';
    verdictHeadline.textContent = 'DO NOT FORWARD — Critical Hoax Warning';
    verdictSubtext.textContent = 'This message contains heavy panic indicators, extreme claims, or viral chain-forwarding pressure. Do not share with friends or family groups.';
  } else if (res.riskScore >= 61) {
    verdictIcon.textContent = '⚠️';
    verdictHeadline.textContent = 'High Misinformation Risk — Cross-Check Required';
    verdictSubtext.textContent = 'This message uses alarming unverified language. Real public emergencies are always broadcast on major news networks and verified disaster handles.';
  } else if (res.riskScore >= 31) {
    verdictIcon.textContent = '🔍';
    verdictHeadline.textContent = 'Needs Verification — Treat With Caution';
    verdictSubtext.textContent = 'The alert mentions emergency terms but lacks verifiable government links or bulletin numbers. Verify with local news before taking action.';
  } else {
    verdictIcon.textContent = '✅';
    verdictHeadline.textContent = 'Likely Authentic Emergency Advisory';
    verdictSubtext.textContent = 'The message matches standard public safety advisory phrasing and contains verified references. Follow instructions from local emergency authorities.';
  }

  // 3. Circular Gauge Meter
  const gaugeFill = document.getElementById('gauge-fill');
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (res.riskScore / 100) * circumference;

  gaugeFill.style.strokeDashoffset = offset;
  gaugeFill.style.stroke = getRiskColor(res.riskScore);

  animateScoreCounter('gauge-score-value', res.riskScore);
  document.getElementById('gauge-status-text').textContent = res.classification;

  // 4. Confidence Display
  document.getElementById('confidence-value').textContent = `${res.confidence}%`;
  document.getElementById('confidence-bar').style.width = `${res.confidence}%`;

  // 5. Detected Vector Count & Tags
  document.getElementById('flagged-triggers-count').textContent = res.firedVectorsCount;
  const tagsContainer = document.getElementById('triggers-tags-list');
  tagsContainer.innerHTML = '';

  const vectorNames = [
    { key: 'urgency', label: 'Urgency Spikes' },
    { key: 'fear', label: 'Fear Inducers' },
    { key: 'authority', label: 'Fake Authority' },
    { key: 'forwarding', label: 'Virality Coercion' },
    { key: 'formatting', label: 'Anomaly Formatting' }
  ];

  vectorNames.forEach(v => {
    if (res.vectorScores[v.key] > 20) {
      const tag = document.createElement('span');
      tag.className = 'vector-tag';
      tag.textContent = v.label;
      tagsContainer.appendChild(tag);
    }
  });

  if (tagsContainer.children.length === 0) {
    tagsContainer.innerHTML = '<span class="vector-tag">Low Threat Profile</span>';
  }

  // 6. Recommended Action Card
  document.getElementById('action-icon').textContent = res.recommendedAction.icon;
  document.getElementById('action-heading').textContent = res.recommendedAction.heading;
  document.getElementById('action-body').textContent = res.recommendedAction.body;

  // 7. Interactive Message Highlighter
  const highlightDisplay = document.getElementById('highlighted-text-display');
  highlightDisplay.innerHTML = generateHighlightedHtml(res.originalText, res.highlights);

  // 8. Vector Breakdown Grid
  const breakdownGrid = document.getElementById('vectors-breakdown-grid');
  breakdownGrid.innerHTML = '';

  const breakdownData = [
    { name: 'Urgency Pressure', score: res.vectorScores.urgency, color: 'var(--hl-urgency)' },
    { name: 'Fear / Disaster', score: res.vectorScores.fear, color: 'var(--hl-fear)' },
    { name: 'Authority Credibility', score: res.vectorScores.authority, color: 'var(--hl-authority)' },
    { name: 'Forwarding Virality', score: res.vectorScores.forwarding, color: 'var(--hl-forwarding)' },
    { name: 'Format Anomaly', score: res.vectorScores.formatting, color: 'var(--hl-format)' }
  ];

  breakdownData.forEach(item => {
    const box = document.createElement('div');
    box.className = 'vector-progress-box';
    box.innerHTML = `
      <div class="vector-box-header">
        <span class="vector-name">${item.name}</span>
        <span class="vector-score" style="color: ${item.color}">${item.score}%</span>
      </div>
      <div class="vector-bar-track">
        <div class="vector-bar-fill" style="width: ${item.score}%; background-color: ${item.color}"></div>
      </div>
    `;
    breakdownGrid.appendChild(box);
  });

  // 9. Rationale List
  const rationaleListEl = document.getElementById('rationale-list');
  rationaleListEl.innerHTML = '';
  res.rationale.forEach(r => {
    const li = document.createElement('li');
    li.className = 'rationale-item';
    li.innerHTML = `
      <span class="rationale-bullet">${r.icon}</span>
      <div>
        <strong>[${escapeHtml(r.vector)}]</strong> ${escapeHtml(r.text)}
      </div>
    `;
    rationaleListEl.appendChild(li);
  });

  // 10. Emergency Safety Protocol Guidance
  document.getElementById('safety-category-title').textContent = res.safetyGuidance.category;
  const guidelinesBox = document.getElementById('safety-guidelines-box');
  guidelinesBox.innerHTML = '';

  res.safetyGuidance.guides.forEach(g => {
    const card = document.createElement('div');
    card.className = 'safety-guide-card';
    card.innerHTML = `
      <h5>🛡️ ${escapeHtml(g.title)}</h5>
      <p>${escapeHtml(g.text)}</p>
    `;
    guidelinesBox.appendChild(card);
  });

  // Smooth scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Animated counter for score gauge
 */
function animateScoreCounter(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const duration = 800;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = targetValue / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      el.textContent = targetValue;
      clearInterval(timer);
    } else {
      el.textContent = Math.round(current);
    }
  }, stepTime);
}

function getRiskColor(score) {
  if (score >= 81) return 'var(--risk-crit)';
  if (score >= 61) return 'var(--risk-high)';
  if (score >= 31) return 'var(--risk-med)';
  return 'var(--risk-low)';
}

/* ============================================================================
   5. SPEECH RECOGNITION & TEXT-TO-SPEECH (ACCESSIBILITY)
   ============================================================================ */

/**
 * Initialize Speech-to-Text Microphone Dictation
 */
function initVoiceInput() {
  const voiceBtn = document.getElementById('voice-input-btn');
  const voiceLabel = document.getElementById('voice-btn-label');
  const textarea = document.getElementById('alert-text');

  if (!voiceBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice dictation is not supported in this browser.';
    voiceBtn.addEventListener('click', () => {
      showToast('Voice input is not supported in this browser. Please type or paste.', 'error');
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    STATE.isRecording = true;
    voiceBtn.classList.add('recording');
    if (voiceLabel) voiceLabel.textContent = 'Listening...';
    showToast('Microphone active. Speak the emergency alert message now.', 'info');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    if (textarea) {
      textarea.value = transcript;
      updateCharCounter();
      hideValidationError();
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    STATE.isRecording = false;
    voiceBtn.classList.remove('recording');
    if (voiceLabel) voiceLabel.textContent = 'Dictate';
    showToast(`Voice input error: ${event.error}`, 'error');
  };

  recognition.onend = () => {
    STATE.isRecording = false;
    voiceBtn.classList.remove('recording');
    if (voiceLabel) voiceLabel.textContent = 'Dictate';
    showToast('Voice dictation captured.', 'success');
  };

  voiceBtn.addEventListener('click', () => {
    if (STATE.isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

/**
 * Text-to-Speech Verdict Readout
 */
function initAudioVerdict() {
  const listenBtn = document.getElementById('listen-verdict-btn');
  const listenText = document.getElementById('listen-btn-text');

  if (!listenBtn) return;

  if (!('speechSynthesis' in window)) {
    listenBtn.style.display = 'none';
    return;
  }

  listenBtn.addEventListener('click', () => {
    if (!STATE.currentAnalysis) {
      showToast('Analyze an alert first to listen to the verdict.', 'info');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      STATE.isSpeaking = false;
      listenText.textContent = 'Listen';
      return;
    }

    const res = STATE.currentAnalysis;
    const speechText = `Sentinel Alert Analysis result. Risk level: ${res.riskLevel}. Score: ${res.riskScore} out of 100. Classification: ${res.classification}. Recommended action: ${res.recommendedAction.heading}. ${res.recommendedAction.body}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      STATE.isSpeaking = true;
      listenText.textContent = 'Stop';
      showToast('Playing audio verdict summary...', 'info');
    };

    utterance.onend = () => {
      STATE.isSpeaking = false;
      listenText.textContent = 'Listen';
    };

    utterance.onerror = () => {
      STATE.isSpeaking = false;
      listenText.textContent = 'Listen';
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Generates WhatsApp Debunk Reply
 */
function initWhatsAppDebunk() {
  const debunkBtn = document.getElementById('whatsapp-debunk-btn');
  if (!debunkBtn) return;

  debunkBtn.addEventListener('click', () => {
    if (!STATE.currentAnalysis) return;
    const res = STATE.currentAnalysis;

    let replyText = `⚠️ *[FAKE EMERGENCY ALERT WARNING]* ⚠️\n\n`;
    if (res.riskScore >= 61) {
      replyText += `Please *DO NOT FORWARD* the emergency message above. It was analyzed by Sentinel-Alert AI and flagged with a *${res.riskScore}/100 Risk Score (${res.classification})*.\n\n`;
      replyText += `🚩 *Why it was flagged:* Contains unverified panic language and viral forwarding pressure.\n`;
      replyText += `✅ *Safe Action:* Real emergency bulletins are always published on official portals like https://ndma.gov.in and major live news channels. Let's verify before sharing! 🙏`;
    } else {
      replyText += `Checked on Sentinel-Alert AI: This emergency advisory appears *${res.classification} (Risk: ${res.riskScore}/100)*. Always follow instructions from local authorities.`;
    }

    navigator.clipboard.writeText(replyText).then(() => {
      showToast('Copied polite WhatsApp debunk reply to clipboard! Ready to paste into groups.', 'success');
    }).catch(() => {
      showToast('Could not copy to clipboard.', 'error');
    });
  });
}

/* ============================================================================
   6. HISTORY & LOCALSTORAGE MANAGEMENT
   ============================================================================ */

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem('sentinel_history');
    STATE.history = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse history from localStorage', e);
    STATE.history = [];
  }
  renderHistoryTable();
  updateDashboardStats();
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem('sentinel_history', JSON.stringify(STATE.history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

function recordAnalysisToHistory(res) {
  const historyItem = {
    id: res.id,
    timestamp: res.timestamp,
    text: res.originalText,
    source: res.metadata.source || 'Direct Entry',
    riskScore: res.riskScore,
    riskLevel: res.riskLevel,
    classification: res.classification,
    firedVectorsCount: res.firedVectorsCount
  };

  STATE.history.unshift(historyItem);
  saveHistoryToStorage();
  renderHistoryTable();
  updateDashboardStats();
}

function deleteHistoryItem(id) {
  STATE.history = STATE.history.filter(item => item.id !== id);
  saveHistoryToStorage();
  renderHistoryTable();
  updateDashboardStats();
  showToast('Analysis log entry deleted.', 'info');
}

function clearAllHistory() {
  if (STATE.history.length === 0) {
    showToast('History is already empty.', 'info');
    return;
  }
  if (confirm('Are you sure you want to delete all saved analysis logs? This cannot be undone.')) {
    STATE.history = [];
    saveHistoryToStorage();
    renderHistoryTable();
    updateDashboardStats();
    showToast('All analysis history logs cleared.', 'success');
  }
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-tbody');
  const emptyState = document.getElementById('empty-history-state');
  const searchInput = document.getElementById('history-search-input');
  const riskFilter = document.getElementById('history-risk-filter');

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filterVal = riskFilter ? riskFilter.value : 'all';

  if (!tbody) return;

  const filtered = STATE.history.filter(item => {
    const matchesSearch = !searchTerm ||
      item.text.toLowerCase().includes(searchTerm) ||
      item.source.toLowerCase().includes(searchTerm) ||
      item.classification.toLowerCase().includes(searchTerm);

    const matchesRisk = filterVal === 'all' || item.riskLevel.toLowerCase() === filterVal;
    return matchesSearch && matchesRisk;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('history-table').classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  document.getElementById('history-table').classList.remove('hidden');

  filtered.forEach(item => {
    const tr = document.createElement('tr');

    let badgeClass = 'low';
    if (item.riskLevel === 'CRITICAL') badgeClass = 'critical';
    else if (item.riskLevel === 'HIGH') badgeClass = 'high';
    else if (item.riskLevel === 'MEDIUM') badgeClass = 'medium';

    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;">
        ${escapeHtml(item.timestamp)}
      </td>
      <td class="history-text-col" title="${escapeHtml(item.text)}">
        ${escapeHtml(item.text)}
      </td>
      <td class="history-score-cell" style="color: ${getRiskColor(item.riskScore)}">
        ${item.riskScore} / 100
      </td>
      <td>
        <span class="chip-tag ${badgeClass}">${escapeHtml(item.classification)}</span>
      </td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">
        ${item.firedVectorsCount} flagged
      </td>
      <td class="actions-col">
        <div class="history-row-actions">
          <button type="button" class="history-action-btn load-btn" data-id="${item.id}" title="Re-load in Detector">
            Load
          </button>
          <button type="button" class="history-action-btn delete" data-id="${item.id}" title="Delete Record">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const found = STATE.history.find(h => h.id === id);
      if (found) {
        document.getElementById('alert-text').value = found.text;
        document.getElementById('alert-source').value = found.source !== 'Direct Entry' ? found.source : '';
        updateCharCounter();
        const analysis = analyzeAlert(found.text, { source: found.source });
        STATE.currentAnalysis = analysis;
        renderResults(analysis);
        showToast('Loaded past alert analysis.', 'info');
      }
    });
  });

  tbody.querySelectorAll('.history-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteHistoryItem(id);
    });
  });
}

/* ============================================================================
   7. REAL-TIME DASHBOARD & METRICS COMPUTATION
   ============================================================================ */

function updateDashboardStats() {
  const totalScans = STATE.history.length;
  let critCount = 0;
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;
  let totalScoreSum = 0;

  STATE.history.forEach(item => {
    totalScoreSum += item.riskScore;
    if (item.riskLevel === 'CRITICAL') critCount++;
    else if (item.riskLevel === 'HIGH') highCount++;
    else if (item.riskLevel === 'MEDIUM') medCount++;
    else lowCount++;
  });

  const avgScore = totalScans > 0 ? Math.round(totalScoreSum / totalScans) : 0;

  document.getElementById('stats-total-scans').textContent = totalScans;
  document.getElementById('stats-critical-count').textContent = critCount;
  document.getElementById('stats-high-count').textContent = highCount;
  document.getElementById('stats-low-count').textContent = lowCount;
  document.getElementById('donut-avg-score').textContent = avgScore;

  const critPct = totalScans > 0 ? Math.round((critCount / totalScans) * 100) : 0;
  const highPct = totalScans > 0 ? Math.round((highCount / totalScans) * 100) : 0;
  const medPct = totalScans > 0 ? Math.round((medCount / totalScans) * 100) : 0;
  const lowPct = totalScans > 0 ? Math.round((lowCount / totalScans) * 100) : 0;

  document.getElementById('legend-crit-pct').textContent = `${critPct}% (${critCount})`;
  document.getElementById('legend-high-pct').textContent = `${highPct}% (${highCount})`;
  document.getElementById('legend-med-pct').textContent = `${medPct}% (${medCount})`;
  document.getElementById('legend-low-pct').textContent = `${lowPct}% (${lowCount})`;

  renderDonutChart(critCount, highCount, medCount, lowCount, totalScans);
  renderPatternFrequencyBars();
}

function renderDonutChart(crit, high, med, low, total) {
  const svg = document.getElementById('distribution-donut-svg');
  if (!svg) return;

  svg.innerHTML = '<circle cx="50" cy="50" r="38" class="donut-base"></circle>';

  if (total === 0) return;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { count: crit, color: 'var(--risk-crit)' },
    { count: high, color: 'var(--risk-high)' },
    { count: med, color: 'var(--risk-med)' },
    { count: low, color: 'var(--risk-low)' }
  ];

  let accumulatedOffset = 0;

  segments.forEach(seg => {
    if (seg.count === 0) return;
    const segmentLength = (seg.count / total) * circumference;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', String(radius));
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('stroke', seg.color);
    circle.setAttribute('stroke-dasharray', `${segmentLength} ${circumference}`);
    circle.setAttribute('stroke-dashoffset', String(-accumulatedOffset));
    svg.appendChild(circle);

    accumulatedOffset += segmentLength;
  });
}

function renderPatternFrequencyBars() {
  const container = document.getElementById('patterns-bar-chart');
  if (!container) return;

  let urgencyCount = 0;
  let authorityCount = 0;
  let forwardingCount = 0;
  let formattingCount = 0;
  let disasterCount = 0;

  STATE.history.forEach(h => {
    const lower = h.text.toLowerCase();
    if (/urgent|breaking|immediately|right now|do not ignore/i.test(lower)) urgencyCount++;
    if (/government confirmed|police confirmed|scientists|nasa|who confirmed/i.test(lower)) authorityCount++;
    if (/forward|share this|send to 20|dont delete/i.test(lower)) forwardingCount++;
    if (/[!]{2,}|\b[A-Z]{4,}\b/i.test(h.text)) formattingCount++;
    if (/earthquake|flood|attack|explosion|cyclone/i.test(lower)) disasterCount++;
  });

  const maxVal = Math.max(1, urgencyCount, authorityCount, forwardingCount, formattingCount, disasterCount);

  const patterns = [
    { name: 'Artificial Urgency Spikes', count: urgencyCount, pct: Math.round((urgencyCount / maxVal) * 100) },
    { name: 'Spoofed Authority Claims', count: authorityCount, pct: Math.round((authorityCount / maxVal) * 100) },
    { name: 'Forwarding / Virality Coercion', count: forwardingCount, pct: Math.round((forwardingCount / maxVal) * 100) },
    { name: 'Catastrophic Disaster Keywords', count: disasterCount, pct: Math.round((disasterCount / maxVal) * 100) },
    { name: 'Exclamation & Caps Anomaly', count: formattingCount, pct: Math.round((formattingCount / maxVal) * 100) }
  ];

  container.innerHTML = '';
  patterns.forEach(p => {
    const item = document.createElement('div');
    item.className = 'pattern-bar-item';
    item.innerHTML = `
      <div class="pattern-bar-meta">
        <span class="pattern-name">${p.name}</span>
        <span class="pattern-count">${p.count} detected</span>
      </div>
      <div class="pattern-track">
        <div class="pattern-fill" style="width: ${p.pct}%;"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

/* ============================================================================
   8. OPTIONAL AI API INTEGRATION SECTION (Modular Bridge)
   ============================================================================ */

async function callGeminiAPIBridge(text, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('No API Key provided. Using offline heuristics.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a forensic emergency misinformation detector. Analyze the following emergency alert:
"${text}"

Evaluate whether it exhibits fake urgency, unverified claims, or disaster hoaxes.
Respond with ONLY valid JSON strictly matching this format:
{
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "classification": "Likely Trustworthy" | "Needs Verification" | "Likely Misleading" | "Highly Suspicious",
  "confidence": number (50-99),
  "explanation": "concise rationale sentence",
  "threatVectors": ["Urgency", "Unverified Authority", etc.]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    })
  });

  if (!response.ok) {
    throw new Error(`API returned HTTP status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse JSON from API response');

  return JSON.parse(jsonMatch[0]);
}

/* ============================================================================
   9. EVENT LISTENERS & INITIALIZATION
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initTheme();
  initNavigation();
  initFormControls();
  initSamplePresets();
  initVoiceInput();
  initAudioVerdict();
  initWhatsAppDebunk();
  initModals();
  initExportAndPrint();
  loadHistoryFromStorage();
  initProfile();

  // Instant demo trigger from hero button
  const heroDemoBtn = document.getElementById('hero-demo-btn');
  if (heroDemoBtn) {
    heroDemoBtn.addEventListener('click', () => {
      loadSampleAlert(1, true);
    });
  }

  // If no history exists, pre-load demo analysis
  if (STATE.history.length === 0) {
    loadSampleAlert(1, false);
  }
});

function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const loginForm = document.getElementById('login-form');
  const guestButton = document.getElementById('guest-login-btn');
  const passwordToggle = document.getElementById('password-toggle');
  const forgotButton = document.getElementById('forgot-password-btn');
  const errorMessage = document.getElementById('login-error');
  const savedProfile = JSON.parse(localStorage.getItem('sentinel_profile') || 'null');

  if (!loginScreen || !loginForm) return;

  if (savedProfile) {
    document.getElementById('login-username').value = savedProfile.username || '';
    document.getElementById('login-first-name').value = savedProfile.firstName || '';
    document.getElementById('login-last-name').value = savedProfile.lastName || '';
    document.getElementById('login-email').value = savedProfile.email || '';
  }

  const unlock = () => {
    loginScreen.classList.add('hidden');
    sessionStorage.setItem('sentinel_authenticated', 'true');
  };

  if (sessionStorage.getItem('sentinel_authenticated') === 'true' || localStorage.getItem('sentinel_remembered') === 'true') {
    unlock();
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const firstName = document.getElementById('login-first-name').value.trim();
    const lastName = document.getElementById('login-last-name').value.trim();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !firstName || !lastName) {
      errorMessage.textContent = 'Enter your username, first name, and last name.';
      return;
    }
    if (!email || !email.includes('@')) {
      errorMessage.textContent = 'Enter a valid email address.';
      return;
    }
    if (password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters.';
      return;
    }
    localStorage.setItem('sentinel_profile', JSON.stringify({
      username,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      location: savedProfile?.location || ''
    }));
    if (document.getElementById('remember-login').checked) localStorage.setItem('sentinel_remembered', 'true');
    unlock();
  });

  guestButton.addEventListener('click', unlock);
  passwordToggle.addEventListener('click', () => {
    const passwordInput = document.getElementById('login-password');
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.textContent = isPassword ? 'HIDE' : 'SHOW';
    passwordToggle.setAttribute('aria-label', `${isPassword ? 'Hide' : 'Show'} password`);
  });
  forgotButton.addEventListener('click', () => {
    errorMessage.textContent = 'Password recovery is unavailable in offline demo mode.';
  });
}

function initProfile() {
  const profileForm = document.getElementById('profile-form');
  const signoutButton = document.getElementById('profile-signout-btn');
  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  const usernameInput = document.getElementById('profile-username-input');
  const firstNameInput = document.getElementById('profile-first-name-input');
  const lastNameInput = document.getElementById('profile-last-name-input');
  const displayName = document.getElementById('profile-display-name');
  const displayEmail = document.getElementById('profile-display-email');
  const locationInput = document.getElementById('profile-location-input');
  const displayRegion = document.getElementById('profile-display-region');
  const avatar = document.getElementById('profile-avatar');
  const saveMessage = document.getElementById('profile-save-message');
  const scanCount = document.getElementById('profile-scan-count');
  const historyCount = document.getElementById('profile-history-count');
  const savedProfile = JSON.parse(localStorage.getItem('sentinel_profile') || 'null');

  if (!profileForm) return;
  if (savedProfile) {
    usernameInput.value = savedProfile.username || '';
    firstNameInput.value = savedProfile.firstName || '';
    lastNameInput.value = savedProfile.lastName || '';
    nameInput.value = savedProfile.name;
    emailInput.value = savedProfile.email;
    locationInput.value = savedProfile.location || '';
  }
  const renderProfile = () => {
    if (!firstNameInput.value && !lastNameInput.value) {
      const nameParts = (nameInput.value || '').trim().split(/\s+/);
      firstNameInput.value = nameParts[0] || '';
      lastNameInput.value = nameParts.slice(1).join(' ');
    }
    displayName.textContent = nameInput.value || 'Alert Sentinel';
    displayEmail.textContent = emailInput.value || 'sentinel@example.com';
    displayRegion.textContent = locationInput.value.trim() || 'Region not set';
    avatar.textContent = displayName.textContent.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    scanCount.textContent = STATE.history.length;
    historyCount.textContent = STATE.history.length;
  };
  renderProfile();
  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!usernameInput.value.trim() || !firstNameInput.value.trim() || !lastNameInput.value.trim() || !nameInput.value.trim() || !emailInput.value.includes('@')) {
      saveMessage.textContent = 'Complete username, name, and email fields.';
      return;
    }
    localStorage.setItem('sentinel_profile', JSON.stringify({
      username: usernameInput.value.trim(),
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      location: locationInput.value.trim()
    }));
    renderProfile();
    saveMessage.textContent = 'Profile saved locally.';
  });
  signoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('sentinel_authenticated');
    localStorage.removeItem('sentinel_remembered');
    document.getElementById('login-screen').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', STATE.theme);
      localStorage.setItem('sentinel_theme', STATE.theme);
      showToast(`Switched to ${STATE.theme} mode`, 'info');
    });
  }
}

function initNavigation() {
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.section-view');

  const showView = (targetId, updateHash = true) => {
    const target = document.getElementById(targetId);
    if (!target || !target.classList.contains('section-view')) return;
    views.forEach(view => view.classList.toggle('is-hidden', view !== target));
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`));
    if (updateHash) history.replaceState(null, '', `#${targetId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const initialView = window.location.hash.slice(1);
  showView(document.getElementById(initialView)?.classList.contains('section-view') ? initialView : 'hero', false);

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView(link.getAttribute('href').slice(1));
      if (navMenu) navMenu.classList.remove('open');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.classList.contains('nav-link')) return;
    const targetId = link.getAttribute('href').slice(1);
    if (document.getElementById(targetId)?.classList.contains('section-view')) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showView(targetId);
      });
    }
  });
}

function initFormControls() {
  const textarea = document.getElementById('alert-text');
  const form = document.getElementById('detector-form');
  const clearBtn = document.getElementById('clear-input-btn');
  const pasteBtn = document.getElementById('paste-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');
  const metaToggle = document.getElementById('metadata-toggle');
  const metaAccordion = document.querySelector('.metadata-accordion');

  if (textarea) {
    textarea.addEventListener('input', updateCharCounter);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textarea.value = '';
      updateCharCounter();
      hideValidationError();
      textarea.focus();
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          textarea.value = clipText;
          updateCharCounter();
          hideValidationError();
          showToast('Pasted content from clipboard', 'success');
        }
      } catch (err) {
        showToast('Unable to access clipboard. Please paste manually.', 'error');
      }
    });
  }

  if (metaToggle && metaAccordion) {
    metaToggle.addEventListener('click', () => {
      const isOpen = metaAccordion.classList.toggle('open');
      metaToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      form.reset();
      updateCharCounter();
      hideValidationError();
      document.getElementById('results-container').classList.add('hidden');
      document.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
      showToast('Form reset.', 'info');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = textarea.value.trim();

      if (!text) {
        showValidationError('Please enter or paste an emergency alert message to analyze.');
        textarea.focus();
        return;
      }

      if (text.length < 10) {
        showValidationError('Alert message is too short (minimum 10 characters required for forensic analysis).');
        return;
      }

      hideValidationError();
      triggerAnalysis(text);
    });
  }
}

async function triggerAnalysis(text) {
  const analyzeBtn = document.getElementById('analyze-btn');
  const spinner = document.getElementById('analyze-spinner');
  const btnText = document.getElementById('analyze-btn-text');

  if (analyzeBtn) analyzeBtn.disabled = true;
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Running Forensic Engine...';

  const metadata = {
    source: document.getElementById('alert-source')?.value.trim() || '',
    location: document.getElementById('alert-location')?.value.trim() || '',
    time: document.getElementById('alert-time')?.value.trim() || ''
  };

  try {
    await new Promise(r => setTimeout(r, 200));

    let analysisResult;

    if (STATE.inferenceMode === 'api' && STATE.apiKey) {
      try {
        const apiData = await callGeminiAPIBridge(text, STATE.apiKey);
        analysisResult = analyzeAlert(text, metadata);
        analysisResult.riskScore = apiData.riskScore ?? analysisResult.riskScore;
        analysisResult.riskLevel = apiData.riskLevel ?? analysisResult.riskLevel;
        analysisResult.classification = apiData.classification ?? analysisResult.classification;
      } catch (apiErr) {
        console.warn('API error, falling back to local heuristics:', apiErr);
        showToast('External API call failed. Reverted to offline NLP engine.', 'info');
        analysisResult = analyzeAlert(text, metadata);
      }
    } else {
      analysisResult = analyzeAlert(text, metadata);
    }

    STATE.currentAnalysis = analysisResult;
    renderResults(analysisResult);
    recordAnalysisToHistory(analysisResult);
    showToast(`Analysis Complete: ${analysisResult.classification}`, 'success');

  } catch (error) {
    console.error('Analysis failed:', error);
    showToast('Analysis error occurred. Please try again.', 'error');
  } finally {
    if (analyzeBtn) analyzeBtn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Analyze Emergency Alert';
  }
}

function updateCharCounter() {
  const textarea = document.getElementById('alert-text');
  const counter = document.getElementById('char-count');
  if (textarea && counter) {
    const len = textarea.value.length;
    counter.textContent = len;
    if (len > 1800) counter.style.color = 'var(--risk-crit)';
    else counter.style.color = 'var(--text-muted)';
  }
}

function showValidationError(msg) {
  const err = document.getElementById('validation-error');
  if (err) {
    err.textContent = msg;
    err.classList.remove('hidden');
  }
}

function hideValidationError() {
  const err = document.getElementById('validation-error');
  if (err) {
    err.classList.add('hidden');
  }
}

function initSamplePresets() {
  const chips = document.querySelectorAll('.sample-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleId = parseInt(chip.getAttribute('data-sample'), 10);
      loadSampleAlert(sampleId, true);
    });
  });
}

function loadSampleAlert(sampleId, shouldAnalyze = true) {
  const sample = SAMPLE_ALERTS.find(s => s.id === sampleId);
  if (!sample) return;

  const textarea = document.getElementById('alert-text');
  const sourceInput = document.getElementById('alert-source');
  const locationInput = document.getElementById('alert-location');
  const timeInput = document.getElementById('alert-time');

  if (textarea) textarea.value = sample.text;
  if (sourceInput) sourceInput.value = sample.source;
  if (locationInput) locationInput.value = sample.location;
  if (timeInput) timeInput.value = sample.time;

  updateCharCounter();
  hideValidationError();

  document.querySelectorAll('.sample-chip').forEach(c => {
    c.classList.toggle('active', parseInt(c.getAttribute('data-sample'), 10) === sampleId);
  });

  if (shouldAnalyze) {
    triggerAnalysis(sample.text);
  }
}

function initModals() {
  // 1. Guide Modal
  const guideModal = document.getElementById('guide-modal');
  const openGuideBtn = document.getElementById('guide-modal-btn');
  const closeGuideBtn = document.getElementById('close-guide-modal');
  const closeGuideBtn2 = document.getElementById('close-guide-modal-btn2');

  const openGuide = () => guideModal && guideModal.classList.remove('hidden');
  const closeGuide = () => guideModal && guideModal.classList.add('hidden');

  if (openGuideBtn) openGuideBtn.addEventListener('click', openGuide);
  if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeGuide);
  if (closeGuideBtn2) closeGuideBtn2.addEventListener('click', closeGuide);

  // 2. Resources Modal
  const resModal = document.getElementById('resources-modal');
  const openResBtn = document.getElementById('open-resources-modal-btn');
  const closeResBtn = document.getElementById('close-resources-modal');
  const closeResBtn2 = document.getElementById('close-resources-modal-btn2');
  const footerResLink = document.getElementById('footer-resources-link');

  const openResModal = () => resModal && resModal.classList.remove('hidden');
  const closeResModal = () => resModal && resModal.classList.add('hidden');

  if (openResBtn) openResBtn.addEventListener('click', openResModal);
  if (footerResLink) footerResLink.addEventListener('click', (e) => { e.preventDefault(); openResModal(); });
  if (closeResBtn) closeResBtn.addEventListener('click', closeResModal);
  if (closeResBtn2) closeResBtn2.addEventListener('click', closeResModal);

  // 3. API Config Modal
  const apiModal = document.getElementById('api-modal');
  const openApiBtn = document.getElementById('api-modal-btn');
  const footerApiLink = document.getElementById('footer-api-link');
  const closeApiBtn = document.getElementById('close-api-modal');
  const cancelApiBtn = document.getElementById('cancel-api-modal');
  const saveApiBtn = document.getElementById('save-api-settings');
  const apiKeyInput = document.getElementById('user-api-key');

  const openApiModal = () => {
    if (apiKeyInput) apiKeyInput.value = STATE.apiKey;
    if (apiModal) apiModal.classList.remove('hidden');
  };
  const closeApiModal = () => apiModal && apiModal.classList.add('hidden');

  if (openApiBtn) openApiBtn.addEventListener('click', openApiModal);
  if (footerApiLink) footerApiLink.addEventListener('click', (e) => { e.preventDefault(); openApiModal(); });
  if (closeApiBtn) closeApiBtn.addEventListener('click', closeApiModal);
  if (cancelApiBtn) cancelApiBtn.addEventListener('click', closeApiModal);

  if (saveApiBtn) {
    saveApiBtn.addEventListener('click', () => {
      const mode = document.querySelector('input[name="inferenceEngine"]:checked')?.value || 'heuristic';
      const key = apiKeyInput ? apiKeyInput.value.trim() : '';

      STATE.inferenceMode = mode;
      STATE.apiKey = key;
      localStorage.setItem('sentinel_engine', mode);
      sessionStorage.setItem('sentinel_api_key', key);

      const badge = document.getElementById('engine-status-badge');
      if (badge) {
        badge.textContent = mode === 'api' ? 'Gemini API' : 'NLP Engine';
      }

      closeApiModal();
      showToast(`Saved Engine Settings: ${mode.toUpperCase()} Mode`, 'success');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === guideModal) closeGuide();
    if (e.target === resModal) closeResModal();
    if (e.target === apiModal) closeApiModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGuide();
      closeResModal();
      closeApiModal();
    }
  });

  const searchInput = document.getElementById('history-search-input');
  const riskFilter = document.getElementById('history-risk-filter');
  if (searchInput) searchInput.addEventListener('input', renderHistoryTable);
  if (riskFilter) riskFilter.addEventListener('change', renderHistoryTable);

  const clearAllBtn = document.getElementById('clear-all-history-btn');
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllHistory);
}

function initExportAndPrint() {
  const copyBtn = document.getElementById('copy-summary-btn');
  const printBtn = document.getElementById('print-report-btn');
  const exportHistoryBtn = document.getElementById('export-history-btn');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!STATE.currentAnalysis) {
        showToast('No active analysis to copy.', 'error');
        return;
      }
      const res = STATE.currentAnalysis;
      const summaryText = `--- SENTINEL-ALERT FORENSIC REPORT ---
Analysis ID: #${res.id}
Date/Time: ${res.timestamp}
Original Alert: "${res.originalText}"
Risk Score: ${res.riskScore} / 100 (${res.riskLevel} RISK)
Classification: ${res.classification}
AI Confidence: ${res.confidence}%
Primary Recommendation: ${res.recommendedAction.heading} - ${res.recommendedAction.body}

Key Rationale:
${res.rationale.map(r => `* [${r.vector}] ${r.text}`).join('\n')}

SAFETY NOTICE: This is an automated decision-support assessment. During physical emergencies, always follow instructions from local emergency authorities.`;

      navigator.clipboard.writeText(summaryText).then(() => {
        showToast('Forensic summary copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
      if (STATE.history.length === 0) {
        showToast('No history records available to export.', 'info');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(STATE.history, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sentinel_alert_history_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('History exported as JSON file.', 'success');
    });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function uniqueArray(arr) {
  return [...new Set(arr)];
}
