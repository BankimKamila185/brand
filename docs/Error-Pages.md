# Error & Success Page Copy - The Outliers Studio

This document contains copy for our system errors, transaction states, and success page screens, using brand-specific, customer-friendly UX copy.

---

## 1. 404 Page - Page Not Found

### UX Tone
Gen Z, streetwear themed, relaxed but functional.

* **Headline**: "404 // Lost in Transit."
* **Sub-text**: "The page you are looking for has dropped off the grid. It either moved, changed, or never existed in this collection."
* **Action Buttons**:
  * `[Back to the Studio]` (Primary redirect link to homepage)
  * `[Shop New Drops]` (Direct link to shop page)

---

## 2. 500 Page - Internal Server Error

### UX Tone
Apologetic, reassurance of security, technical assistance links.

* **Headline**: "500 // Glitch in the Studio."
* **Sub-text**: "Our servers are experiencing a temporary system overload. Don't worry, your cart and session data are secure. We are patching things up."
* **Action Buttons**:
  * `[Retry Page]` (Refreshes the current route)
  * `[Check Support Status]` (Links to [Contact Us](Contact.md))

---

## 3. Out of Stock Notice & Badge

### UX Tone
Creates urgency, invites user engagement.

* **Badge Text**: `SOLD OUT // NO RESTOCKS`
* **Out of Stock Form Header**: "Missed the drop?"
* **Form Sub-text**: "Input your details below. We will ping you via email or WhatsApp if we get a size return, or when the next seasonal streetwear collection drops."
* **Input Placeholder**: `Enter email or phone number`
* **Action Button**: `Notify Me`
* **Alternative Suggestion**: "While you wait, check out our other highly-rated [Oversized Sweatshirts](file:///shop/sweatshirts)."

---

## 4. Payment Failed Page

### UX Tone
Reassuring, clear diagnostic steps, secure payment gateway notices.

* **Headline**: "Payment Failed // Transaction Incomplete"
* **Sub-text**: 
  > "Your transaction could not be processed. This happens due to bank server timeouts, incorrect card details, or failed OTP validation."
* **Reassurance Block**:
  > "⚠️ **If money was debited from your account**: Rest assured, your funds are safe. It will automatically reverse back to your bank account within 3–5 working days. No funds are collected by us for failed checkouts."
* **Action Buttons**:
  * `[Try Payment Again]` (Redirects back to Checkout page with items preserved in cart)
  * `[Choose Different Payment Method]` (Directs to the payments selection step)
  * `[Contact Support]` (Redirects to [Contact.md](Contact.md))

---

## 5. Payment Success & Order Confirmed Page

### UX Tone
Celebratory, informative, clear delivery expectation.

* **Headline**: "Payment Successful // Order Confirmed!"
* **Sub-text**: 
  > "Welcome to the circle. Your transaction was processed securely. We have sent an email and SMS containing your receipt and order details."
* **Order Info Summary**:
  * **Order ID**: `#OUT-[Generated_ID]`
  * **Estimated Delivery**: 3 to 7 business days.
* **Next Steps Infographic Copy**:
  1. **Step 1: Processing**: We are picking and packing your items at our Bengaluru hub (24-48 hours).
  2. **Step 2: Shipping**: You'll receive a WhatsApp and email tracking link as soon as your package leaves our warehouse.
  3. **Step 3: Delivery**: Our delivery partner will contact you prior to dropping off your shipment.
* **Action Buttons**:
  * `[Continue Shopping]` (Redirects to shop page)
  * `[Track Order Status]` (Redirects to [Track Order](Customer-Support.md#track-order))

---

## 6. Order Cancelled Page

* **Headline**: "Order Cancelled // Refund Initiated"
* **Sub-text**: 
  > "Your order `#OUT-[Generated_ID]` has been cancelled. If this was a prepaid order, a full refund is being processed back to your card or UPI source via Razorpay. It should reflect in your account within 5–7 business days."
* **Action Button**: `[Return to Homepage]`
