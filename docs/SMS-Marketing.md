# SMS Marketing Consent - The Outliers Studio

In accordance with telecom regulations in India (TRAI guidelines) and the DPDPA 2023, promotional SMS text messages can only be sent to customers who provide explicit, affirmative consent. Transactional SMS messages (order tracking, OTPs) are treated under Legitimate Use and are sent automatically.

This document contains the production-ready copy for SMS marketing opt-ins and disclosures.

---

## 1. Checkout Opt-In Text

### UI Placement
Located in the checkout payment/contact details step, next to the mobile number input field. The checkbox must be **unchecked by default**.

### Copy
* **Checkbox Label**:
  > "Get early access alerts and promotional discounts via SMS."
* **Supporting Consent Text (Small font)**:
  > "By checking this box, you consent to receive recurring automated marketing text messages (e.g. cart reminders, new drops, sale alerts) from The Outliers Studio at the mobile number provided. Consent is not a condition of purchase. Message and data rates may apply. You can opt out at any time by replying STOP to our sender ID or visiting your account settings."

---

## 2. SMS Types & Consent Classification

| SMS Category | Trigger Event | Consent Requirement | Regulatory Category (TRAI) |
| :--- | :--- | :--- | :--- |
| **OTP Verification** | Login / Password Reset | Required for core function (Implied) | Service Implicit |
| **Order Confirmation** | Successful payment | Legitimate Use (Contractual) | Service Implicit |
| **Shipping Tracking** | Dispatch / Out for Delivery | Legitimate Use (Contractual) | Service Implicit |
| **Cart Recovery** | Abandoned checkout cart | **Explicit Opt-in required** | Service Explicit / Promotional |
| **Promotional Drops** | New collection launch | **Explicit Opt-in required** | Promotional |
| **Exclusive Coupon** | Birthday discount/Sale | **Explicit Opt-in required** | Promotional |

---

## 3. Mandatory SMS Structure (Indian DLT Templates)
Under TRAI's Distributed Ledger Technology (DLT) regulations, all promotional SMS headers must clearly display our registered brand name and contain a standard opt-out mechanism.

### Example Promotional SMS Template
* **Sender ID**: `OUTLRS` (or similar registered header)
* **SMS Text**:
  > "THE OUTLIERS STUDIO: The new Oversized Graphic Collection has dropped! Get 10% off your first fit with code OUTLIER10. Shop now: [Link]. To opt-out, reply STOP to [Number]."
