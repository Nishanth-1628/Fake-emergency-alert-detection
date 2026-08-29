# 🛡️ SENTINEL-ALERT // AI-Based Fake Emergency Alert Detector

> **A real-time, explainable, client-side crisis information verification platform built with pure HTML5, CSS3, and Vanilla JavaScript.**

---
   
## 📌 1. Project Overview

During natural disasters, terrorist threats, epidemics, and civil emergencies, unverified rumors and synthetic alarmist broadcasts propagate exponentially faster than verified emergency bulletins. Panic-driven viral forwarding leads to stampedes, resource misallocation, civil disruption, and immense psychological distress.

**SENTINEL-ALERT** is an emergency information security and decision-support web application designed to analyze broadcast alerts, SMS forwards, and social posts. It generates an immediate forensic risk assessment, classifies the probability of misinformation, provides transparent **Explainable AI (XAI)** diagnostics, highlights manipulative phrasing, guides users through authentic verification channels, and offers context-aware survival safety protocols .

---
   
## 🚀 2. Strict Technology Stack

This application is built with **ZERO external frameworks, backend servers, or third-party libraries**:

* **HTML5**: Semantic document structure, ARIA accessibility standards, SVG vector icons, dynamic template containers.
* **CSS3**: Modern responsive CSS Grid and Flexbox layouts, custom variables design tokens supporting real-time Dark and Light themes, glassmorphism, animated SVG stroke-dash gauges, and print stylesheet.
* **Vanilla JavaScript (ES6+)**: Custom Natural Language Processing (NLP) tokenization, multi-vector threat heuristics, statistical score weighting, dynamic DOM manipulation, and `localStorage` vault management.

---

## 🌟 3. Key Features

### 🔍 A. Multi-Vector Alert Analysis
* **Urgency & Panic Drivers**: Detects time-scarcity pressure (`URGENT`, `BREAKING`, `IMMEDIATELY`, `BEFORE IT'S TOO LATE`, etc.).
* **Fear & Disaster Language**: Identifies high-casualty or extreme hazard claims (`massive earthquake`, `explosion`, `bomb attack`, `toxic gas`, etc.).
* **Unverified Authority Attribution**: Identifies vague or spoofed institutional citations (`government confirmed`, `police reported`, `secret sources`, `NASA alerted`).
* **Excessive Certainty & Scientific Impossibility**: Flags deterministic assertions (e.g. predicting earthquakes for specific exact hours like *"tonight at 10 PM"*, which is scientifically impossible).
* **Viral Forwarding & Social Contagion**: Flags classic chain-message manipulation (`Forward to 20 people`, `Share with everyone`).
* **Formatting & Typographic Anomalies**: Scans for high UPPERCASE character ratios, repeated punctuation cascades (`!!!`, `???`), and suspicious/shortened link domains (`bit.ly`, `tinyurl`).
* **Credibility Mitigations**: Automatically discounts risk score when verified governmental portals (`.gov.in`, `ndma.gov.in`, `fema.gov`, `usgs.gov`) or official disaster bulletin reference numbers are detected.

### 📊 B. Risk Scoring & Classification System
The normalized composite score (0–100) maps directly to 4 distinct operational tiers:

| Score Range | Risk Level | Classification | Primary Recommendation |
| :--- | :--- | :--- | :--- |
| **0 – 30** | `LOW RISK` | **Likely Trustworthy** | Follow standard civil defense and emergency instructions. |
| **31 – 60** | `MEDIUM RISK` | **Needs Verification** | Cross-check with local news and official bulletins before sharing. |
| **61 – 80** | `HIGH RISK` | **Likely Misleading** | High rumor probability; verify against major live news feeds. |
| **81 – 100** | `CRITICAL RISK` | **Highly Suspicious** | **Halt forwarding immediately.** Extreme indicators of viral panic hoax. |

### 💡 C. Explainable AI (XAI) & Interactive Message Highlighter
* **Visual Token Highlighter**: Color-codes suspicious words and phrases directly within the original message (Urgency = Red, Fear = Purple, Authority = Amber, Forwarding = Magenta, Formatting = Cyan) with interactive hover tooltips explaining the risk rationale.
* **Sub-Vector Progress Meters**: Individual diagnostic meters for Urgency Pressure, Fear Index, Authority Credibility, Viral Forwarding, and Formatting.
* **Forensic Evidence Log**: Bulleted rationale detailing exactly why the alert received its score.

### 🚨 D. Context-Aware Emergency Safety Protocol
When catastrophic disaster keywords are detected, the system immediately presents contextual life-safety instructions:
* **Earthquake / Seismic**: *Drop, Cover & Hold On*; gas shutoff, aftershock awareness.
* **Floods / Inundation**: *Turn Around, Don't Drown*; electrical breaker shutoff, high-ground evacuation.
* **Fire / Explosion**: *Immediate stair evacuation, stay low under smoke, emergency dispatch notification.*
* **Cyclones / Severe Storms**: *Interior room sheltering away from glass, power bank charging, eye-of-the-storm awareness.*
* **Chemical / Hazmat**: *Upwind evacuation, room sealing, decontamination.*

### 📋 E. Verification Checklist & Official Resources Hub
* **Interactive 6-Point Verification Checklist** for citizen fact-checking.
* **Official Emergency Directory Modal** linking to authenticated portals including:
  * NDMA (National Disaster Management Authority)
  * USGS (Earthquake Hazards Program)
  * IMD & NOAA (National Weather & Cyclone Services)
  * PIB Fact Check & International Fact-Checking Networks

### 📈 F. Dynamic Incident Statistics & History Vault
* **Local Data Vault (`localStorage`)**: Saves past forensic scans with timestamp, score, and classification.
* **Data Management**: Search filter, risk tier filter, single-item deletion, clear-all, and one-click JSON export.
* **Pure SVG/CSS Analytics**: Real-time distribution donut chart and pattern prevalence bars calculated purely on the client side with 0 telemetry tracking.

---

## 📂 4. Project Folder Structure

```text
fake-emergency-alert-detector/
│
├── index.html       # Semantic HTML5 UI, modals, SVGs, and responsive containers
├── style.css        # Pure CSS3 theme system (Dark/Light), layout grid, animations
├── script.js        # Heuristic NLP engine, XAI diagnostics, charts, and storage
└── README.md        # Comprehensive documentation and technical specification
```

---

## 🏃 5. How to Run the Application

Because this project uses 100% standard web technologies with zero dependencies or build steps, running it is effortless:

1. **Clone or Download** this folder:
   ```bash
   cd fake-emergency-alert-detector
   ```
2. **Open in any modern browser**:
   * **Option A**: Double-click `index.html` directly.
   * **Option B (VS Code)**: Right-click `index.html` and select **"Open with Live Server"**.
   * **Option C (Command Line)**:
     ```powershell
     Start-Process "index.html"
     ```

No `npm install`, Node.js server, Python backend, or database setup is required.

---

## 🔌 6. Optional External AI API Integration (Gemini API)

The system is fully autonomous out of the box using its built-in heuristic NLP engine. If you wish to connect an external Large Language Model:

1. Click the **"NLP Engine" / Settings** button in the top navigation bar.
2. Select **"External Gemini / LLM API Integration"**.
3. Enter your Gemini API key (e.g., `AIzaSy...`).
4. Click **Save Settings**.
5. The key is stored safely in temporary `sessionStorage` and is never logged or exposed.
6. If the external network request fails, the application automatically and gracefully falls back to the built-in offline engine.

---

## 🧪 7. Built-in Preset Test Cases

The application includes 5 pre-configured demonstration alerts:

1. **Sample 1 (High Risk / Critical)**: *"URGENT!!! Massive earthquake will definitely hit Chennai tonight at 10 PM. Government has confirmed this. Forward this message to everyone immediately!!!"*
2. **Sample 2 (Suspicious / High)**: *"Breaking news! Police have confirmed that all mobile networks and internet services will be shut down tomorrow across the state. Share this message with your friends before it's too late."*
3. **Sample 3 (Needs Verification / Medium)**: *"Authorities are advising residents in flood-prone areas to remain alert due to heavy rainfall forecasted over the weekend. Keep emergency kits ready."*
4. **Sample 4 (Likely Trustworthy / Low)**: *"District disaster authorities have issued an official flood warning for low-lying sectors along the river basin. Residents are advised to follow evacuation instructions from local authorities. Official Bulletin #DRM-2026-88. Verify at https://ndma.gov.in"*
5. **Sample 5 (Critical Risk)**: *"100% CONFIRMED!!! A dangerous explosion attack is going to happen tomorrow in shopping malls. Do not ignore this alert! Send it to 20 people right now or you will be responsible!"*

---

## 🔒 8. Privacy & Data Protection

* **100% Client-Side Computation**: All text normalization, pattern matching, risk scoring, and highlight generation occur entirely in the user's browser memory.
* **No Tracking or Telemetry**: No third-party analytics trackers, cookies, or remote databases are utilized.
* **Local Storage Privacy**: Scan history remains exclusively on the client machine and can be cleared with a single click.

---

## ⚠️ 9. Mandatory Life-Safety Disclaimer

> **IMPORTANT DISCLAIMER:**
> This system is an automated decision-support and media literacy tool designed to identify manipulative and unverified linguistic patterns in textual emergency messages.
> **It does NOT replace civil defense authorities, meteorology departments, or law enforcement emergency dispatches.**
> In the event of an actual physical emergency or natural disaster, always follow certified evacuation instructions and life-safety directives from local first responders.

---

## 📜 10. License & Attribution

Designed and developed for academic research, final-year capstone demonstrations, hackathons, and public safety information verification.
* Developed with standard **HTML5 / CSS3 / Vanilla JS**.
