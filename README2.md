
# Project Overview

Users purchase a subscription from the Antigravity frontend.
Stripe processes the payment and sends a webhook event.
Stripe CLI forwards the event to a local n8n webhook.
n8n processes the event and stores the data in Airtable.



# System Flowchart

A[User Clicks Pro Plan in Antigravity] --> B[Stripe Checkout Page]
B --> C[User Completes Payment]
C --> D[Stripe Generates Event checkout.session.completed]
D --> E[Stripe CLI Forwards Event]
E --> F[n8n Webhook Trigger]
F --> G[Check Event Node]
G --> H[Extract Payment Fields]
H --> I[Create Airtable Record]
I --> J[Return 200 Response to Stripe]


# Technologies Stack

-   Antigravity (Frontend)
-   Stripe (Payment Gateway)
-   Stripe CLI (Local Webhook Processing)
-   n8n (Workflow Automation)
-   Airtable (Database Storage)


# Stripe Setup

## 1. Create Stripe Account

Open:

https://dashboard.stripe.com

Enable **Test Mode** for development.



## 2. Create Product

Navigate to:

Stripe Dashboard → Product Catalog → Products

Create product:

Pro Plan

Price: ₹50 / month

Billing: Recurring Monthly

After creating the product copy the **Price ID**.

Example:

price_1T6nyJLfYjpIrCT3n1bJUBsu


## 3. Create Payment Link

Navigate to:

Stripe Dashboard → Payment Links

Create a payment link for the **Pro plan**.

Example link:

https://buy.stripe.com/test_xxxxxxxxx



# Antigravity Frontend Setup

Open the Antigravity project and configure the **Pro plan button**.

Button configuration:

Action Type: Open URL

Paste the Stripe Payment Link.

Example:

https://buy.stripe.com/test_xxxxx

When a user clicks the button they are redirected to the Stripe checkout
page.



# Stripe CLI Installation

Download Stripe CLI from:

https://github.com/stripe/stripe-cli/releases

Extract the file.

Move the executable to:

C:`\Program `{=tex}Files`\Stripe`{=tex}

Add this directory to **System Environment Variables → PATH**.

Verify installation:

stripe --version



# Stripe CLI Authentication

Run:

stripe login

A browser will open to authenticate the Stripe account.



# Forward Stripe Webhooks

Start forwarding events to the local n8n webhook.

stripe listen --forward-to localhost:5678/webhook-test/stripe-payment

Example output:

Ready! Your webhook signing secret is whsec_xxxxx



# n8n Setup

Start n8n locally.

n8n start

Open:

http://localhost:5678


# n8n Workflow Flowchart


A[Webhook Trigger] --> B[IF Node Check Event]
B -->|checkout.session.completed| C[Edit Fields Node]
C --> D[Airtable Create Record]
D --> E[Respond to Webhook 200]


# Webhook Node Configuration

HTTP Method: POST

Path: stripe-payment

Authentication: None

Response Mode: Using Respond to Webhook Node

Test Webhook URL:

http://localhost:5678/webhook-test/stripe-payment



# IF Node (Check Event)

Condition:

{{\$json\["type"\]}} equals checkout.session.completed

This ensures only successful payments trigger the workflow.



# Edit Fields Node

Extract required data from the Stripe event.

payment_id

{{\$json\["data"\]\["object"\]\["id"\]}}

email

{{\$json\["data"\]\["object"\]\["customer_details"\]\["email"\]}}

amount

{{\$json\["data"\]\["object"\]\["amount_total"\] / 100}}

currency

{{\$json\["data"\]\["object"\]\["currency"\]}}

status

{{\$json\["data"\]\["object"\]\["payment_status"\]}}

created

{{\$json\["data"\]\["object"\]\["created"\]}}

Enable:

Keep Only Set



# Airtable Setup

Create an Airtable base.

Base name:

payment

Create table:

Stripe

Fields required:

payment_id → Text
email → Email
amount → Number
currency → Text
status → Text
created → Number



# Airtable API Token

Go to:

Airtable → Developer Hub → Personal Access Tokens

Create token with permissions:

data.records:read
data.records:write
schema.bases:read

Grant access to the "payment base".



# Airtable Node Configuration in n8n

Resource: Record

Operation: Create

Base: payment

Table: Stripe

Field mapping:

payment_id → {{$json["payment_id"]}} 
email → {{$json\["email"\]}} 
amount→ {{$json["amount"]}} 
currency → {{$json\["currency"\]}} 
status →{{$json["status"]}} 
created → {{$json\["created"\]}}



# Respond to Webhook Node

Response Code: 200

Respond With: No Data

This confirms successful webhook processing to Stripe.


# Testing the Workflow

Step 1

Start n8n.

Step 2

Run Stripe CLI forwarding.

stripe listen --forward-to localhost:5678/webhook-test/stripe-payment

Step 3

Click the Pro plan button in Antigravity.

Step 4

Complete payment using Stripe test card.

Test card number:

4242 4242 4242 4242

Expiry: Any future date

CVC: Any three digits



# Expected Result

Stripe processes the payment.

Stripe CLI forwards the webhook to n8n.

n8n processes the event.

Airtable automatically creates a new record with payment data.

 

# Notes

Local testing requires:

-   n8n running
-   Stripe CLI running
-   Antigravity frontend active

For production deployment, Stripe webhooks should point directly to a
public n8n endpoint.
