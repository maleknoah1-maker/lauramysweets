---
title: "How Far in Advance Should You Order a Custom Cake? | Laura, My Sweets"
headline: "How far in advance should you order a custom cake?"
heading: "How far ahead should you <em>order a cake?</em>"
label: Cake guides
date: 2026-10-18
description: "When to order a custom cake for a birthday, wedding or party, plus the 5-day Quick Order option from Laura, My Sweets in Coopersburg, PA."
lede: "A simple timeline for birthdays, weddings and parties, and what to do when your date is close."
related: [quick-order, order, menu]
faqs_post:
  - q: "How far in advance should I order a custom cake from Laura, My Sweets?"
    a: "[[PLACEHOLDER: how far ahead to order custom cakes]] Quick Order cakes need 5 full days' notice."
  - q: "What if my party is less than a week away?"
    a: "Look at the Quick Order cakes: six set designs in 6 or 8 inch sizes, ready with 5 days' notice. You can also text (484) 293-1329 to ask about a custom cake."
  - q: "Can I book a date before I've picked a design?"
    a: "[[PLACEHOLDER: whether Laura holds dates before the design is final]]"
---
The short answer: the earlier the better, especially for busy weekends, holidays and weddings. Custom cakes are made to order, and a home bakery can only take so many orders for any one weekend.

## Custom cakes at Laura, My Sweets

For custom cakes, here's Laura's guideline: {{ settings.leadTime | ph | safe }}

Wedding cakes and tiered cakes take more planning, from design to tasting the flavors you want, so reach out as soon as you have a date. Holiday weekends and graduation season also fill up quickly.

## When you're short on time: Quick Order cakes

If your party is coming up fast, [Quick Order cakes](/quick-order/) are set designs that need just {{ quickOrder.noticeDays }} full days' notice. Order by {{ computed.cutoffLabel }}, {{ quickOrder.noticeDays }} days before your pickup day. For example, order by {{ computed.cutoffLabel }} {{ computed.cutoffSchedule[0].orderDay }} for {{ computed.cutoffSchedule[0].pickupDay }} pickup.

They come in two sizes:

{% for sz in quickOrder.sizes %}- **{{ sz.label }}**, serves {{ sz.serves }}
{% endfor %}
Prices start at {{ computed.quickFrom | money }}, and colors can be changed to match your party.

## What to have ready when you order

You don't need every detail, but these help Laura give you a price quickly:

- Your event date and whether you want pickup or delivery
- About how many people you're serving
- Flavor and filling ideas (see the [menu](/menu/#flavors))
- Colors, a theme or inspiration photos, which you can text to {{ settings.phone }}

When you're ready, [send a custom order request](/order/) or text or call {{ settings.phone }}.
