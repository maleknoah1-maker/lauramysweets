---
title: "Cake Size Guide: How Many Servings Do You Need? | Laura, My Sweets"
headline: "Cake size guide: how many servings do you need?"
heading: "Cake size guide: <em>how many servings?</em>"
label: Cake guides
date: 2026-10-18
description: "How many people a 6, 8 or 10 inch cake serves, with prices, plus tips for picking the right cake size for your party from Laura, My Sweets."
lede: "How many people each cake size serves, and how to pick the right one for your party."
related: [menu, birthday-cakes, quick-order]
faqs_post:
  - q: "How many people does a 6 inch cake serve?"
    a: "A 6 inch cake from Laura, My Sweets serves 12."
  - q: "How many people does an 8 inch cake serve?"
    a: "An 8 inch cake serves 20."
  - q: "How many people does a 10 inch cake serve?"
    a: "A 10 inch cake serves 30. For bigger groups, ask about a tiered cake."
  - q: "What if I need more servings than a 10 inch cake?"
    a: "Tiered cakes are sized to your guest count and priced by quote. You can also add cupcakes or cake pops to stretch servings."
---
Picking a cake size comes down to one number: how many people you're serving. Here's how Laura's cake sizes work out.

## Servings by cake size

| Size | Serves | Price |
|---|---|---|
{% for c in menu.cakes.items %}| {{ c.name }} | {{ c.serves }} | {{ c.price | money }}{% if c.plus %}+{% endif %} |
{% endfor %}| Tiered cakes | Sized to your guest count | Contact for pricing |

Prices are starting points. The final price depends on your design.

## Tips for choosing a size

- **Count the people who will actually eat cake.** Very young kids often share, and some guests skip dessert.
- **Plan for other desserts.** If you're also serving cupcakes, cake pops or a dessert table, you may not need as large a cake.
- **Round up for a big crowd.** If you're between sizes, the larger one is the safer pick.
- **Need more than 30 servings?** A [tiered cake](/wedding-cakes/) is sized to your guest count.

## Quick Order sizes

[Quick Order cakes](/quick-order/) come in the two most popular sizes:

{% for sz in quickOrder.sizes %}- **{{ sz.label }}**, serves {{ sz.serves }}
{% endfor %}
## Stretching servings with small treats

Cupcakes start at {{ computed.cupcakeFrom | money }} a dozen and cake pops at {{ computed.cakePopFrom | money }} a dozen, with a minimum of 1 dozen per flavor. See [cupcakes and cake pops](/cupcakes-cake-pops/) for every option.

Still not sure? Tell Laura your guest count in a [custom order request](/order/) and she'll help you pick.
