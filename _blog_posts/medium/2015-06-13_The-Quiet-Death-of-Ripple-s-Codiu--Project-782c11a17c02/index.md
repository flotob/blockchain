---
title: The Quiet Death of Ripple’s Codiu§ Project
date: 2015-06-13T00:00:00.000Z
medium_id: 782c11a17c02
original_url: https://medium.com/@heckerhut/the-quiet-death-of-ripple-s-codiu-project-782c11a17c02
is_draft: false
hero_image: /assets/images/medium/2015-06-13_The-Quiet-Death-of-Ripple-s-Codiu--Project-782c11a17c02-1*jD9N_laS4ciIMLEwlPhvDw.jpeg
---

Why decentralized infrastructure has still a long way to go

* * *

!\[\](/assets/images/medium/2015-06-13\_The-Quiet-Death-of-Ripple-s-Codiu--Project-782c11a17c02-1\*jD9N\_laS4ciIMLEwlPhvDw.jpeg)

## The Quiet Death of Ripple’s Codiu§ Project

### Why decentralized infrastructure has still a long way to go

* * *

[Ripple Labs Inc](https://www.ripplelabs.com/), steward of the [Ripple Protocol](http://ripple.com) and manager of the second largest cryptocurrency by market capitalization after Bitcoin, has quietly shelved the open source project Codius, which it had founded [about a year ago](http://github.com/codius/codius) and actively maintained ever since. Although the code was eventually versioned to a symbolic “1.0”, the project never gained much more than the curious attention of some hardcore enthusiasts.

Now, [Stefan Thomas](https://twitter.com/justmoon), CTO of Ripple Labs, has outlined the future of Codius in a [recent blog](https://codius.org/blog/codius-one-year-later/) post:

> \[…\] we’ve realized that Codius is an optimization and — right now, with a small and nascent decentralization market — a premature one. **We have no plans to work on a Codius 2.0**, instead we are building our own decentralized applications “manually” as described above.

Of course, the code behind the Codius project is up for the taking to anyone able to type _git clone._ But the project didn’t hit EOL prematurely because of a lack of developer resources — quite the contrary. Rather, the feedback of the community was simply not strong enough to justify the expenditure.

Ripple Lab’s decision is interesting for many reasons. Most importantly though, should this event be a warning to all those currently investing their time and money into building a global and decentralized infrastructure?

#### **The idea behind Codiu§**

Codius is an answer to the following question:

> How to execute software in an untrusted environment and still be able to trust whatever the software has computed?

There are different ways to answer that question and each one comes with a specific set of systemic compromises. Codius was interesting in that it delivered a complementary set of such advantages and disadvantages vis-a-vis the popular Blockchain infrastructure that solves the problem of trusted code execution for networks such as Bitcoin, Ethereum and many more.

**Same Same But Different  
**Codius too leverages _the principle of distributed consensus_ to achieve the desired trust property of its system. However, whereas Bitcoin & Co build a completely separate communication infrastructure on top of the TCP/IP stack, thereby slowing the network’s computational power down by [a factor of ~10000](#), Codius leverages existing commodity webhosting infrastructure to run arbitrary code at normal speeds and at much cheaper cost than a “Virtual Blockchain Computer” could ever dream to accomplish.

The difference lies in the size of the consensus pools when comparing Codius’ and e.g. Bitcoin’s consensus scheme. In the Codius world, there is no ‘global’ consensus pool as there is in Bitcoin, for the simple reason that a Codius pool does not drive a global payment network. A Codius consensus pool is better compared to >>YOU<< doing some google searches for the purpose of finding the cheapest vendor of a certain tech gadget you plan to purchase. Once you’ve found enough websites referring e.g. to Amazon as the cheapest supplier of the desired product, you’ll eventually settle on making your order in their store.

_Congratulations.  
You have reached an inner consensus._

The number of google searches you would perform until you’ve decided _where_ to purchase can be roughly compared to the number of Codius instances you would spawn into a specific consensus pool, whose quorum decision you would entrust to perform certain sensitive operations in your name, such as ordering a product on amazon, or paying recurring subscription fees to various services.\[1\]

#### Codius in a Blockchain Ecosystem: Local vs. Global

In order to understand the purpose that Codius was intended to serve in the wider Blockchain ecosystem, one has to understand the systemic limitations of the latter. For all the security that Blockchains are able to generate through their crypto-economic governance and incentive scheme, they suffer from inherent slowness when it comes to _general-purpose_ computation\[2\], as well as from an inherent blindness when it comes to incorporating rich information about the outside world.

This is where Codius’ complementary infrastructure decisions unfold their beneficial value to Blockchain-driven networks. Whereas Blockchains are good at delivering **global consensus** among thousands to millions of nodes, Codius’ solution is intended to deliver **local consensus** relevant only to specific individuals.\[3\]

The affordances of **local consensus** schemes lie mainly in two areas:

_Computational Complexity and Data Richness._

Since instances of the Codius execution environment are hosted on cheaply available infrastructure they can perform resource-intensive general-purpose computation at a fraction of the cost than a “Blockchain Computer” ever could. Same goes for incorporation of outside information, since unlike a Blockchain, a Codius instance has unfiltered access to the whole internet.

From a Platform vs. Services perspective, the relationship between Blockchains and Codius looks like this:

!\[\](/assets/images/medium/2015-06-13\_The-Quiet-Death-of-Ripple-s-Codiu--Project-782c11a17c02-1\*k-u8b0QF3Ty2QmpkMwQdNw.png)

_If you want to better understand the lower half of the graphic, I advise you to_ [_read this_](https://medium.com/@heckerhut/smart-contracts-platforms-and-intermediaries-c3d30f5182a6)_. This post focuses on the upper half, i.e. the Codius service layer._

From a Blockchain-centric viewpoint, Codius constitutes, what is commonly referred as an “Oracle”, i.e. an information gateway between a Blockchain and the outside world. Because the information feed provided by a given Codius oracle has been independently validated by a number of distributed instances, it serves to complement a Blockchain’s inherent trust model.

#### Why Codius’ Trust Model failed

It is mostly unfair to claim that Codius’ trust model _really_ failed — rather: it has _actually_ never been put to the test. The reason for this is what I initially hinted to as the “community feedback”, which was in some sense lacking.

An implicit yet fundamental requirement of Codius’ trust-enabling infrastructure is the existence of a functioning ecosystem of competing hosting-providers that offer the execution of Codius-style containers/vm images. Only if such a market with a functioning competitive landscape is available, does the trust property of Codius’ infrastructure emerge.\[4\]

Codius’ notion of validating outside information works by assuming that although not any singular Codius instance may be trusted, a certain majority quorum of _independent instances_ may indeed be considered trustworthy. As it turns out, the requirement of _independence_ equates to the existence of a complex market-based ecosystem for Codius-style infrastructure provision. An ecosystem that didn’t evolve despite Ripple Labs’s best efforts in terms of generating publicity for the project.

#### What this means for the Decentralization Landscape

In terms of interpreting Codius’ early exit from the landscape of decentralized service providers, two things come to mind.

Firstly, the difference between centralized and decentralized service provision is not valued by a significant share of consumers and businesses in and outside the wider Blockchain ecosystem. Just look at the existing market of _centralized_ service providers for Blockchain-based networks, which is already struggling to find an audience for its products. Conceptually, a centralized service is still much easier to grasp than a decentralized one. Codius never even left the world of command line interfaces.

Secondly, the difference between Codius-like oracles and classic centralized services providers is not just an “optimization problem” as Stefan Thomas likes to put it. It is connected the fundamental question of how much power we want to give to users and how much control should reside with the tech firms that increasingly regulate our daily lives.

* * *

Footnotes

\[1\] Personal Autonomous Agents anyone?

\[2\] As opposed to the much more limited domain of _fiduciary code_, to which Blockchains are essentially limited to. There is currently no other, equally significant _type of code_ in sight, which would justify the investment of similar economic resources as is done e.g. in the case of Bitcoin’s Blockchain, which runs the currency’s internal _fiduciary code_).

\[3\] Vitalik Buterin talks about three kinds of facts: (1) mathematical, (2) global and (3) local. Blockchains excell at (1) but are completely helpless regarding (2) and (3).

\[4\] To the extent, the decision any miner or mining pool in the Bitcoin network implicitely or explicitely makes, namely whether to use its resources to _serve_ or to _attack_ the network, is an economic one, the same goes for hosters of codius instances. Therefore, only if the business of running such instances in an ‘honest fashion’ is economically more desirable than starting to tamper with the computational processees of individual instances (because the hoster _somehow_ profits from a specific outcome), is the _emergence_ of trust feasable.

By [Florian Glatz](https://medium.com/@heckerhut) on [June 13, 2015](https://medium.com/p/782c11a17c02).

[Canonical link](https://medium.com/@heckerhut/the-quiet-death-of-ripple-s-codiu-project-782c11a17c02)

Exported from [Medium](https://medium.com) on January 3, 2025.