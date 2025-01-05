---
title: What’s a Smart Contract? In search of a consensus.
layout: post
date: 2014-12-12T00:00:00.000Z
categories:
  - medium
medium_id: c268c830a8ad
original_url: https://medium.com/@heckerhut/whats-a-smart-contract-in-search-of-a-consensus-c268c830a8ad
is_draft: false
hero_image: /assets/images/medium/2014-12-12_What-s-a-Smart-Contract--In-search-of-a-consensus--c268c830a8ad-1*WWtCLYSV4T5ml_L-gn-aIA.png
---

The concept of smart contracts is gaining traction among wider audiences and with it arises the need for a clear working definition.

* * *

### What are Smart Contracts?

#### In search of a consensus.

By [Florian Glatz](http://blockchain.lawyer)

The concept behind _smart contracts_ is gaining traction among [wider audiences](https://www.google.de/trends/explore#q=smart%20contract) and with it arises the need for a clear working definition. Currently, the excitement around smart contracts is only matched by the confusion surrounding the specific meaning of the term. [Peter Todd](https://twitter.com/petertoddbtc), Bitcoin Core Developer, sums up the status quo quite concisely:

In this article I try to shed new light on the nature of smart contracts. My overarching goal is to make hidden assumptions explicit and to clarify some misconceptions around the mysterious phenomenon in relation to the legal system. However, this is really just my first attempt to find a way to systematize smart contracts. Hopefully, with the feedback of the community, we can arrive at a clearer picture than what we have now.

* * *

_Disclaimer_

As far as legal terminology goes, let me point out that although [**IAAL**](http://de.urbandictionary.com/define.php?term=iaal), I am neither intimately familiar with English legal terminology nor with _Common Law_ systems in general. I am a scholar of the [German](http://en.wikipedia.org/wiki/Civil_law_%28legal_system%29) legal system, which is what I have studied and worked in for close to ten years. I chose my words to the best of my knowledge and Google’s research capabilities, however inaccuracies are unavoidable. Please point out any wrong uses of terminology if you are capable of doing so. On the pro-side, the German’s are crazy about legal doctrine, which might be of help here.

Furthermore, [**IANACS**](https://mail.python.org/pipermail/edu-sig/2001-July/001528.html), although I have been writing computer code professionally for twelve years. Feel free to point out any misconceptions if you find them. Thanks!

* * *

### Origins

The term “smart contract” goes back at least as early as [1995](http://szabo.best.vwh.net/smart_contracts_glossary.html) to prolific interdisciplinary legal scholar [Nick Szabo](http://unenumerated.blogspot.de/), who published [several](http://szabo.best.vwh.net/smart_contracts_2.html) [articles](http://szabo.best.vwh.net/idea.html) on his [website](http://szabo.best.vwh.net/) regarding the idea of smart contracts. His definition goes as follows:

> A smart contract is a set of promises, specified in digital form, including protocols within which the parties perform on these promises.

Let’s take a closer look at what he means by that.

#### Promises

A set of promises refers to the (often mutual) **rights and obligations** to which the parties of a contract consent. Those promises define the nature and purpose of the contract. Take a sales contract as a classic example. The seller promises to deliver the goods in exchange for the buyer promising to pay the desired price.

#### Digital Form

Digital form means that the contract has to be written in **machine-readable code**. This is necessary because the rights and obligations established in the smart contract are executed by a computer or a network of computers as soon as the parties have come to an agreement.

To specify this further:

**(1) coming to an agreement  
**When do the parties of a smart contract come an agreement? The answer depends on the specific smart contract implementation. Generally-speaking, an agreement is found (at the latest) when the parties have committed themselves (irrevocably so) to the execution of the contract by installing the contract on a contract host platform.

**(2) contract execution  
**What “execution” really means is as well implementation-dependent. Generally-speaking, execution means pro-active enforcement mediated by technological means.

(3) **machine-readable code  
**Furthermore, the specific “digital form” the contract needs to be drafted in depends heavily on the choice of protocols which the parties agree to use.

#### Protocols

Protocols are the technical implementation on the basis of which contractual promises are fulfilled or upon which the fulfillment is being documented in a binding way. Which protocols are chosen depends on many factors, most importantly though **the nature of the assets that are to be exchanged** during contract performance. Take our sales contract again as an example. Say the parties agree that the purchased good is to be paid in bitcoins. The obvious protocol of choice would then be the Bitcoin protocol\[1\], upon which the smart contract is implemented. Consequently, the “digital form” within which the contract would have to be drafted is the [Bitcoin Scripting Language](https://en.bitcoin.it/wiki/Script), a non-turing-complete imperative stack-based computer programming language resembling [Forth](http://en.wikipedia.org/wiki/Forth_%28programming_language%29).

### From theory to practice

_Spoiler: You can skip this chapter if you know about the Bitcoin protocol, bitcoin the currency and the concept of smart property_

When Szabo eternalized his theory nearly twenty years ago on the web, practice was lacking behind considerably. There was no clear path how the idea could be transformed into reality.

Today, technology has caught up with Szabo’s visionary mind and smart contracts start to become viable. What has happened in those twenty years?

In short, the protocols that Szabo theorized in his definition have finally been developed. They have taken the shape of the **Bitcoin protocol**, or more generally, all those protocols that are able to achieve [Nakamoto consensus](http://unenumerated.blogspot.de/2014/12/the-dawn-of-trustworthy-computing.html).

In conjunction with the development of those protocols we got another necessary building block: the first **truly** **native digital assets**, namely bitcoin the currency. Without those assets, smart contracts wouldn’t be viable either, because the financial sector has been extremely hostile to any kind of innovation over the last decades.

And lastly, a concept that has yet to come to full fruition is smart property. We’re venturing into the age of ubiquitous computing and connectivity, commonly referred to as the internet of things. The ability of physical objects to send and retrieve information to and from the internet as well as to control their own usage through software (think [DRM](http://en.wikipedia.org/wiki/Digital_rights_management) technology) enables us to build what Szabo referred to as **embedded contracts.**

> The basic idea of smart contracts is that many kinds of contractual clauses \[…\] can be embedded in the hardware and software we deal with \[…\].

The humble beginnings of embedded contracts Szabo sees in vending machines, Point of Sale terminals (POS), Electronic Data Interchange (EDI) between large corporations and the SWIFT, ACH, and FedWire networks for transferring and clearing payments between banks. Another instance of embedded contracts are DRM-mechanisms in the realm of digital content consumption, such as music, movies and ebooks.

Understood in this sense, smart contracts are the bridge between cyberspace and physical space.

### Smart vs. Legal

Much of the confusion around the concept of smart contracts stems from its name and the language used to describe it. People seem to infer from the usage of the term “contract” that the concept must have something to do with the _legal concept_ of a contract. A smart contract then, according to this logic, is a legally binding agreement plus “x”, where x makes said agreement “smart”.

From a legal standpoint, this presumption is wrong or at least not necessarily true. Depending on the smart contract implementation that one chooses, it is entirely possible for two or more parties to enter into a “smart contract” without said contract constituting the necessary requirements to be considered a valid contract in the legal sense.\[2\]

It his however undeniable, that smart contracts have to be classified as **legally relevant behavior**. We live in a world that is governed by legal statutes that encompass all possible economic transactions (and more). Contract law is just one possible tool to organize economic transactions. A schematic view might look something like this:

![](/assets/images/medium/2014-12-12_What-s-a-Smart-Contract--In-search-of-a-consensus--c268c830a8ad-1*WWtCLYSV4T5ml_L-gn-aIA.png)

Let’s look at the intersection of contract law and smart contracts. Is it possible to find a generalization of the act of contracting that captures both systems? Following [Szabo](http://szabo.best.vwh.net/smart_contracts_2.html),

> The contract, a set of promises agreed to in a “meeting of the minds”, is the traditional way to formalize a relationship.

What Szabo tells us is that the abstract concept of a “contract” is a recognized tool to formalize the relationships between people, institutions and the stuff they own (assets). From the quote it doesn’t become clear, however, how a meeting of minds, an agreement between those minds and the act of formalizing such an agreement relates to each other.

I suggest the following generalized model of contracting:

![](/assets/images/medium/2014-12-12_What-s-a-Smart-Contract--In-search-of-a-consensus--c268c830a8ad-1*wdlFcTIAuYElZkRGupEb0g.png)

Let’s see how this model holds up if we apply it to the concept of smart contracts and contracts in the legal sense.

#### Agreement

An agreement then is a completely platonic condition, abstract from its implementation in a formal system. In reality, of course, this is a [leaky abstraction](http://en.wikipedia.org/wiki/Leaky_abstraction). In the legal system, there is in many cases no requirement to formalize an agreement for it to be legally binding.\[3\] Conversely, regarding smart contracts, there is in many cases no prior agreement (even in a platonic sense) before the act of formalization.\[4\]

#### Formalization

Formalization, as understood here, is the act of implementing the platonic agreement in a formal system. There are two relevant formal systems. One is contract law, the other a smart contract system of your choice. **Both systems serve the same purpose: to allow the agreement to be enforced in case a breach occurs.**

Understood in such a general way, the question of “how” a contract is formalized could be claimed to be a mere [implementation detail](https://twitter.com/JustusRanvier/status/540915338351620098). As it turns out though, the implementation does matter a great deal.

**There are two fundamentally distinct ways of how a contractual relationship can be formalized. They are distinct because they entail different methods of enforcement.**

#### Enforcement

Since a single picture says more than a thousand words, look at this beautiful infographic I plagiarized from [Lawrence Lessig](http://www.lessig.org/about/) and slightly adapted for the purpose of this article.

![](/assets/images/medium/2014-12-12_What-s-a-Smart-Contract--In-search-of-a-consensus--c268c830a8ad-1*Qr6DFyNGAH0Cf3t-1PC8lg.png)

In Lessig’s original version, there is a person at the center (actually it’s a dot representing a person), not a contract. What the great thinker tried to teach us mortals with his original graphic were the four fundamental _constraints_ operating on a person’s life. Those constraints are distinct in nature yet interwoven in complex ways.

My adaptation replaces the person with a contract, here understood as a formalized agreement between two or more parties. Interestingly, the graphic still makes sense. Each of those four constraints does indeed regulate contractual relationships as much as it regulates people.\[5\]

Furthermore I emphasized two of the four constraints, namely **_architecture_** and **_law_**_._ Those are the two fundamental forces through which contractual agreements can be enforced. Depending on the choice of system within which the agreement is formally implemented, enforcement will either happen through the legal system or through architecture. Those two modes of enforcement differ in significant ways.

Lessig recognizes two characteristics of enforcement that help us to talk about this difference. One is **_agency_**_,_ the other **_temporality._** Enforcement of contracts in the legal sense only happens when some person or group chooses to do so (_agency)._ Moreover, enforcement only happens after the breach occurred, i.e. **ex post (**_temporality)._

Enforcement of smart contracts is fundamentally different in both aspects. To understand how, we first need to understand what Lessig means by architecture.

Lessig introduced the notion of architecture in his book [“Code”](http://codev2.cc/) in order to explain the role of code in cyberspace. The shape of physical space, which is what your body moves through when you use our legs, is determined by its architecture, i.e. the _built environment (_such as buildings, streets, etc.). Likewise, the shape of cyberspace is determined by the code upon which the applications and protocols that you use are built. Therefore, code is the architecture of cyberspace.

Both, law and architecture, have a way of regulating behavior. Whereas law depends either on individuals to internalize the rules and adjust their behavior accordingly, or otherwise a system that allows for legal recourse (such as courts), architecture regulates behavior by shaping space itself. Architecture is not about _what is allowed_ but _what is actually possible._ It neither depends on individuals internalizing any rules nor on a system to prosecute deviations.

Regarding the criteria by which we assess the qualities of enforcement, i.e. agency and temporality, architecture is therefore decidedly different. Architecture enforces without the need of any one person or group deciding to act (agency) — you might call it self-enforcing, though I don’t like it\[6\]. Furthermore, architecture enforces ex ante, i.e. breaches are not even possible from the outset.

### Future Outlook

One thing is sure: smart contracts are here to stay. They are the building blocks of a truly global economy to which everyone has access without prior vetting and high upfront costs. They remove the necessity of trust from many economic transactions, and in other instances, shift trust to parties that can be reasonably trusted.

What I tried to establish in this post is a first idea of how smart contracts coexist with contract law. Essentially, they are two different approaches that try to solve the same problem: to formalize a relationship in a way so that promises become enforceable. In this regard, smart contracts seem to be the better solution: smart contracts are enfoceable ex ante, not ex post like contracts in the legal system. However, this is a fallacy. To quote the all-mighty Szabo one last time:

> The success of the common law of contracts, combined with the high cost of replacing it, makes it worthwhile to both preserve and to make use of these principles where appropriate. Yet, the digital revolution is radically changing the kinds of relationships we can have. What parts of our hard-won legal tradition will still be valuable in the cyberspace era? What is the best way to apply these common law principles to the design of our on-line relationships?

There are many established principles in contract law, that are worthwhile to preserve. One of those are [legal default rules](http://en.wikipedia.org/wiki/Default_rule), which I will write about in another blog post.

Another fact, which is central to fully understanding the concept of smart contracts, is that they **do not exist outside of the legal system.** It therefore seems beneficial to take advantage of both, contract law and smart contracts in order to achieve the optimal outcome. How this can be achieved I will tell you in another post.

* * *

_Follow me on Twitter_ [**@heckerhut**](https://twitter.com/heckerhut)_._

_Visit me at_ [**blockchain.lawyer**](http://blockchain.lawyer)

* * *

#### Footnotes

\[1\] Bitcoins are transferred over the Bitcoin protocol. Although bitcoins can be transferred outside of the network’s block chain too by exchanging private keys, the receiver of those keys would naturally transfer the assets as soon as possible in order to make sure only he/she has control over the funds. This transfer could then be considered to document the fulfillment of the contractual promise.

\[2\] This could be because one of the contracting parties lacks [legal capacity](http://en.wikipedia.org/wiki/Capacity_%28law%29) to close a contract, or because the smart contract implementation doesn’t contain the [_essentialia negotii_](http://en.wikipedia.org/wiki/Essentialia_negotii) necessary to close a valid legal contract of the given type. Furthermore, different types of contracts require different formal rules to be respected, serving both as a _warning_ to the parties as well as _documentation_ purposes. It is a commonly held misconception though, that a contract has to be in written form under any circumstance. The principle of [_contractual freedom_](http://en.wikipedia.org/wiki/Freedom_of_contract) tells us, that not even a handshake is required if both parties agree that a contract has been closed, if the law doesn’t state otherwise.

\[3\] In the legal system, a contract is created through “offer” and “acceptance” by two or more parties. However, those declarations of intent to enter into a contract with one another do not have to be made explicit in any way. Any conduct that implies the intent to contract suffices if the law doesn’t state otherwise.

\[4\] Many implementations of smart contracts explicitly intend to solve the problem of allowing parties that do not know each other and share no communication channels to enter into a contract. A “meeting of the minds” before closing a formal agreement is not possible in such a case.

\[5\] Regarding the constraint “market”, § 313 of the German Civil Code allows a contracting party to revoke the contract unilaterally if circumstances which became the basis of a contract (such as market conditions) have significantly changed since the contract was entered into and if the parties would not have entered into the contract or would have entered into it with different contents if they had foreseen this change. Regarding the constraint “norms”, § 138 BGB declares a contract invalid [_ex tunc_](http://en.wikipedia.org/wiki/Ex_tunc) if it violates [_“die guten Sitten”_](http://de.wikipedia.org/wiki/Gute_Sitten#Bedeutung_in_Deutschland), which is a direct reference to unwritten social norms.

\[6\] Does the wall of a building self-enforce itself in your face when you run against it?

By [Florian Glatz](https://medium.com/@heckerhut) on [December 12, 2014](https://medium.com/p/c268c830a8ad).

[Canonical link](https://medium.com/@heckerhut/whats-a-smart-contract-in-search-of-a-consensus-c268c830a8ad)

Exported from [Medium](https://medium.com) on January 3, 2025.