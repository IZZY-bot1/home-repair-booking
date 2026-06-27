# Inbox Cleanup Guide — engalapag@gmail.com

Your four folders already exist: **Urgent Action / Bills**, **Newsletters & Promotions**,
**Work / Client / Personal**, **Other**. No need to create anything.

There are two parts below:

1. **Clear the existing 500+ unread backlog** — using Gmail's bulk "select all" (4 passes, a few clicks each).
2. **Auto-sort future mail** — import the included `gmail-filters.xml`.

> The automated one-at-a-time labeling via the assistant was blocked by per-action
> approval prompts, so this manual-but-fast route is the practical path. The bulk method
> below is actually faster than 1,000 individual approvals.

---

## PART 1 — Clear the existing backlog (do these 4 in order)

For **each** query: paste it into the Gmail search bar → press Enter → click the
**select-all checkbox** (top-left) → click **"Select all conversations that match this search"**
→ apply the label (Labels icon) → then **Archive** (and **Mark as read** for Promotions).

### 1. Urgent Action / Bills  → label + Archive (leave unread)
```
is:unread in:inbox from:(americanexpress.com OR emails.creditonebank.com OR info6.citi.com OR notification.capitalone.com OR chase.com OR notify.wellsfargo.com OR synchronybank.com OR paypal.com OR affirm.com OR e.geico.com OR order-update@amazon.com OR auto-confirm@amazon.com OR shipment-tracking@amazon.com OR return@amazon.com OR help@walmart.com OR uber.com OR openrouter.ai OR vanguard.com OR macdiscount.com OR googleplay-noreply@google.com OR mail.anthropic.com)
```

### 2. Work / Client / Personal  → label + Archive (leave unread)
```
is:unread in:inbox from:(janinealapag@gmail.com OR chenega.com OR calendar-notification@google.com OR lifetimehoamanagement.com OR kairosit.com OR greenhouse-mail.io OR indeedapply@indeed.com OR cbp.dhs.gov)
```

### 3. Newsletters & Promotions  → label + Archive + MARK AS READ
```
is:unread in:inbox from:(gooddog.com OR members.wayfair.com OR skool.com OR amazonmusic.com OR offers.creditonebank.com OR eautodealerhub.com OR searchlightpictures.com OR 20thcenturystudios.com OR d23.com OR att-mail.com OR ashanderie.com OR pdffiller.com OR canvasonthecheap.com OR easycanvasprint.com OR greenbacktaxservices.com OR points-mail.com OR campusespmail.com OR instaservice.com OR growth.twilio.com OR team.twilio.com OR notifications@stripe.com OR netlify.com OR teladochealth.com OR pendosurvey.com OR membershipmail.net OR no-reply@amazon.com OR info15.citi.com)
```

### 4. Other  → label + Archive (leave unread)
```
is:unread in:inbox from:(accounts.google.com OR github.com OR mg.gitlab.com OR notifications@vercel.com OR firebase OR googledev-noreply@google.com OR google-noreply@google.com OR families-noreply@google.com OR link.com OR no-reply@twilio.com OR notifications.t-mobile.com OR ismartlife.me OR gitpage.site OR web3forms.com OR huggingface.co OR netgear.com OR googlepay-noreply@google.com OR info.ebay.com)
```

### 5. Anything left over → Other
After the 4 passes, run this to see whatever remains (mostly junk auto-warranty / fake
insurance spam from random throwaway domains, which can't be matched by a stable sender):
```
is:unread in:inbox
```
Select all → label **Other** → Archive. (Or just delete the obvious spam.)

---

## Notes / judgment calls baked into the rules above
- **Credit One** is split by sub-domain: `emails.creditonebank.com` (statements/balances) = **Bills**;
  `offers.creditonebank.com` (credit-line offers) = **Promotions**.
- **CBP careers** (`cbp.dhs.gov`) is filed under **Work / Personal** (you're job-hunting and have a
  CBP interview), not Promotions.
- **Amazon** is split: order/ship/return addresses = **Bills**; `no-reply@amazon.com` (Alexa reorder
  nudges) and Amazon Music = **Promotions**.
- **Security/login alerts** (Google, GitHub, GitLab, Vercel, Firebase, Link, Twilio codes, T-Mobile) = **Other**.
- The garbled **auto-warranty / "$29/month insurance"** emails are spam that slipped into the inbox;
  they have random rotating domains, so they're caught by the leftover pass (#5), not a filter.

---

## PART 2 — Auto-sort future mail
Import `gmail-filters.xml` (in this same folder):
**Gmail → Settings (gear) → See all settings → Filters and Blocked Addresses →
Import filters → choose the file → Open file → Create filters.**

Tip: on the import screen you can tick **"Also apply filter to matching conversations"**
to retroactively sweep the existing backlog at the same time — that can replace Part 1 entirely.
