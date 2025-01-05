---
title: A Blockchain Token Taxonomy
layout: post
date: 2016-09-10T00:00:00.000Z
categories:
  - medium
medium_id: fadf5c56139a
original_url: https://medium.com/@heckerhut/a-blockchain-token-taxonomy-fadf5c56139a
is_draft: false
hero_image: 
---

Tokens were one of the first applications based on a blockchain infrastructure that pushed the technology beyond its original use as an…

* * *

### A Blockchain Token Taxonomy

Tokens were one of the first applications based on a blockchain infrastructure that pushed the technology beyond its original use as an accounting ledger for a public blockchain network’s base currency. Tokens are themselves units of account, used to keep track of who owns how much of some quantity other than the underlying ledger’s native crypto currency.

Tokens started as meta-information encoded in simple Bitcoin transactions, thereby taking advantage of the Bitcoin blockchain’s strong immutability. At a protocol layer, tokens were outsourced extensions to Bitcoin’s core protocol. Instead of being integrated as a feature on a software level, the first tokens were created based on misappropriating data fields in Bitcoin transactions (such as encoding data in the _amount or op\_return fi_eld). That strategy of extending Bitcoin’s feature set came at the cost of having to develop an additional set of stand-alone client software that implemented the protocol needed to decode the meta-information hidden in Bitcoin transactions.

From there, tokens have evolved significantly, thanks to the shift from blockchains understood as dumb accounting ledgers towards general-purpose state machines with arbitrarily complex (turing-complete) state transition rules. Smart contracts, which are another name for transition rules of distributed state machines, enable the creation of tokens with complex behaviors attached, easily from within the core protocol. Instead of having to develop standalone software for different operating systems in order to allow people to make use of tokens, they can now be created and handled from within all clients supporting the core protocol of such a new type of blockchain (heralded by Ethereum, invented by Vitalik Buterin).

Today, the token concept is central to most social and economic innovations developed with blockchain technology. Something about tokens makes them an ideal proxy to understand the disruptive effects blockchain technology has on the status quo.

> _What is a token?_

A first line to draw is the difference between tokens that are fungible and those which are not. In a strict definition of the term token, the non-fungible variant may be no token at all. But I will rely on a broad definition in the rest of this text.

From a technical perspective, a fungible token is implemented as a list of blockchain addresses (user accounts) that have a number (quantity) associated with them, together with (1) a set of methods used to manipulate that list, such as ‘transfer _n_ tokens from address _a_ to address _b_’, and (2) rules to determine _who_ can manipulate that list in _which way._

Orthogonally, a non-fungible token is _its own_ smart contract that inherits from a given template every time a new instance of such a token is created and where every running instance of such a token contract contains a globally-defined _owner_ address field.

> A question of context

Although smart contracts can be programmed to create any kind of token, they cannot be programmed to understand _what a token is_. The social context necessary to understand what a token represents can, ultimately, only exist in the human mind. A token is a socio-technological construct. It has a technological part, as an entry in a blockchain database and a social part — it’s raison d’être. The social component of a token is defined by an agreement between a group of people. In such an arrangement, tokens represent some aspect of the relationships between individual members of the group. Tokens derive value from faithfully reflecting the changes in those relationships over time.

> _Four dimensions of a token_

**Digital**  
Tokens are the digital identity of something that can be owned by someone. Based on that premise, tokens can have a representational dimension, stretching into the physical, the virtual or the legal realm respectively.

A token can be described as purely digital, if it has no such representational dimension. That’s the case for any blockchain’s base currency (i.e. bitcoin, ether, etc.) as well as for DAO-style tokens. The latter kind of tokens are used for different purposes within the organizational ruleset of a DAO. They can represent voting rights, ownership shares in the ‘company’, virtual stock options, and whatever else one might think of. However, those are just _labels_, applied after the fact. From a causal perspective, the functionality of those tokens is **_immediately_** and **_exclusively_** defined within the smart contract where they are created, or within the network of smart contracts within which such a token can be transferred. In contrast, multi-dimensional tokens might have rather generic methods attached to them that do not disclose their true intent within the code in which they are implemented, but which defer that responsibility to an off-chain agreement instead.

**Physical  
**Tokens can be bound to physical objects through a combination of software and hardware, or through contractual agreements respectively. Because physical objects are not always _legally fungible_, they may either be implemented with a _list-based_ or a _contract-based_ approach (v.s.).

Tokens that are tied to physical objects through software + hardware, are referred to as **smart property** or **smart objects.** Smart objects are IoT devices that have an always-on connection to a network, through which they can communicate with (a subset of) the outside world. Additionally, they are capable of controlling their own usability through a combination of hardware and software features. A typical example for such an arrangement would be anything that can be controlled through an access mechanism such as a physical lock, as found in cars, buildings and many other kinds of physical infrastructure.

For lack of a better position at which to place digital media files and software in general within the suggested token taxonomy, I am mentioning them under the category _physical_. Media files are controlled through access mechanisms as much as physical infrastructure, implemented, however, as ‘digital right management’ software, running on the appliances used to render digital media files consumable for human sensory organs.

Tokens that are tied to physical objects _merely_ through contractual agreements, rely on the legal system as the ultimate enforcement layer to sync on-chain and off-chain ownership of a given physical good. A good example would be many of the public services that may one day be offered on a blockchain-based infrastructure.\[1\] Land registries are such an example, that is already being worked on. Since nation states are the ultimate regulators of physical space, they will have a tendency towards generic token manipulation rules, serving merely as simplistic functions to document the result of complex off-chain decision processes.

**Virtual  
**The virtual-reality dimension of a token is interesting because it reveals something fundamental. It is best explained with a comparison. Before the wide-spread diffusion of the PC and broadband internet access, the legal concept of copyright could be regulated through controlling physical media carriers as proxies (such as books, CDs, etc.). However, recent history taught us that intellectual goods such as films and books were only incidentally tied to physical objects. It turned out that the law, in a fundamentally phenomenological approach towards regulation, assumed that any intellectual good was at the same time an individual physical object that could be treated as such. Digitalization taught us that this assumption only holds true in a pre-digital world, which we have left forever behind. The Internet, for the first time since the invention of copyright, transformed intellectual property as a whole into its _state of nature_. Long before the zero marginal cost of reproduction became an economic reality, it was assumed that intellectual goods were at their core non-rivalrous, ubiquitous goods, i.e. something that cannot be localized in time or space, nor be exclusively ‘owned’ in the way physical goods are. However, because intellectual goods were tied to physical carrier objects by necessity, those properties were never actually realized in practice. Only when personal digital reproduction technology became _ubiquitous_, could intellectual goods become ubiquitous themselves.

Virtual reality may, in case of a similar mass adoption as it happened with smartphones, disrupt another fundamental assumption in contemporary society. The assumption being, that the provision of digital infrastructure can be organized on today’s _centralized_ techno-economic architecture of platform intermediaries. The reason why it cannot, is because private-access database silos are fundamentally incapable of mirroring our common notion of _ownership_ and _control._ No prescription of “data portability” as envisioned in various regulatory models of platform intermediaries can sufficiently ensure the degrees of freedom physical space affords the human species, in the context of which our relevant notion of ownership originally evolved.

It doesn’t actually need virtual reality as the ‘ultimate conclusion of digital’ to prove my point.\[2\] Already today the incompatibilities of our common notion of _ownership_ in relation to digital resources is starting to show. One example is the use of artificial geo-fencing in the digital content market. Digital content providers create geographically-gated communities of users, each with their separate catalogue of available content. This creates friction when users travel across national boarders and are being served different content based on their geographical location. The European Commission now tries to control this phenomenon through a directive on the sale of digital goods and services. The suggested regulation would legally force service providers to more closely align themselves with their users’ understanding of _ownership_ of digital resources.

In that sense, virtual reality may become alongside IoT one of the fundamental driving forces of blockchain technology towards mainstream adoption. By tying virtual reality objects to blockchain-based tokens a realistic model of ownership with all the degrees of freedom available in physical space (and more) may be created.

**Legal  
**Lastly, tokens can represent property rights granted by law such as intellectual property rights, or contractually-defined rights established between two or more parties. In fact, those two kinds of tokens are closely linked when looking at e.g. intellectual property licensing databases, which are currently being built and popularized as a great match for blockchain technology. In their case, the same token represents a property right when resting with its creator and a contractual claim when resting with a licensee.

Maybe the most relevant example though for tokens representing contractual claims are financial instruments implemented on a blockchain infrastructure. Currently, virtually every financial institute experimenting with blockchain technology is developing some form of a token contract. The only differences between them concern their permission rules and the types of transactions that can be performed on them.

> A need for legal recognition?

The concept of blockchain tokens embodies the full potential of blockchain technology. Especially tokens that possess one of the representational dimensions laid out before, are closely linked to the traditional legal system. In order for blockchains to unfold their full potential with regard to reinventing _ownership_ in the digital realm, the technology needs to be recognized _de lege ferenda_ as a system capable of creating an objectively new ontological category. A new kind of _thing_, which deserves its own regulatory framework that reflects the unique affordances and constraints of blockchain technology.

* * *

Footnotes

\[1\] Simply to set my mark with regards to public services on blockchain infrastructure, I’ve been arguing in favor of such an approach towards provision of critical digital infrastructure, also understood as a new form of ‘techno-regulation’ / regulation through architecture, [for over a year now.](https://medium.com/@heckerhut/the-political-economy-of-computing-7fffc75423a2#.nfodkoyxw)

\[2\] Virtual is digital, perceived as physical.

By [Florian Glatz](https://medium.com/@heckerhut) on [September 10, 2016](https://medium.com/p/fadf5c56139a).

[Canonical link](https://medium.com/@heckerhut/a-blockchain-token-taxonomy-fadf5c56139a)

Exported from [Medium](https://medium.com) on January 3, 2025.