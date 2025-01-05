---
title: How we use Smart Contracts at SatoshiPay to change the Internet’s economy forever. Today!
layout: post
date: 2016-02-01T00:00:00.000Z
categories:
  - medium
medium_id: 777988a868d
original_url: https://medium.com/@heckerhut/how-we-use-smart-contracts-at-satoshipay-to-change-the-internet-s-economy-forever-today-777988a868d
is_draft: false
hero_image: /assets/images/medium/2016-02-01_How-we-use-Smart-Contracts-at-SatoshiPay-to-change-the-Internet-s-economy-forever--Today--777988a868d-1*38k0dOwQsQhT37-i-MkEVw.png
---

* * *

### How we use Smart Contracts at SatoshiPay to change the Internet’s Economy [forever](https://www.youtube.com/watch?v=WEkuqv1V4n4&feature=youtu.be&t=158). [Today](https://dashboard.satoshipay.io/sign-up)!

* * *

#### About the Author

Florian Glatz is a lawyer and software developer based in Berlin. At SatoshiPay he develops both software and legal solutions based on Blockchain technology. You can find out more about him at [blockchain.lawyer.](http://blockchain.lawyer)

#### Introduction

Much has been talked about [_Smart Contracts_](https://medium.com/@heckerhut/whats-a-smart-contract-in-search-of-a-consensus-c268c830a8ad#.omtm3341w), the curious idea of machine-readable, auto-enforceable agreements between two or more parties. Originally conceived as a theoretical exercise by interdisciplinary legal scholar [Nick Szabo](https://twitter.com/NickSzabo4) in the early nineties, in an attempt to understand how legal contracts may be transposed into the digital age, they unexpectedly became a “real thing” with the advent of Blockchain-based cryptocurrencies such as Bitcoin.

However, until today, there has been a noticeable lack of real-world implementations of the technology. As intriguing as some potential applications may be, [most of them](https://en.bitcoin.it/wiki/Contracts) have yet to be built. [Multi-signature wallets](https://copay.io/) and Blockchain-based [escrow services](https://www.bitrated.com/) have been the most sophisticated examples of Smart Contract applications until now.\[1\]

#### How SatoshiPay uses Smart Contracts

At SatoshiPay, we are big fans of Bitcoin, the most stable and secure [Smart Contract Platform](http://gendal.me/2015/03/30/bitcoin-as-a-smart-contract-platform/) out there. Although Bitcoin may seem primitive to those focusing on next-generation platforms such as Ethereum, we believe that most of Bitcoin’s potential for complex contracting is yet to be uncovered.

Through a sophisticated mix of proven web technologies\[2\], public-key cryptography and the Bitcoin Blockchain, a new class of innovative, scalable web services can be built and deployed _today_, bringing the advantages of decentralization and financial self-reliance to the unwashed masses of the Internet.

In effect, what we built at SatoshiPay, is a new type of web-based intermediary, which I’m calling **trustless intermediary.** The SatoshiPay service mediates contractual negotiations and performance between buyers and sellers of digital goods, without those parties having to trust the service with their money.\[3\]

![](/assets/images/medium/2016-02-01_How-we-use-Smart-Contracts-at-SatoshiPay-to-change-the-Internet-s-economy-forever--Today--777988a868d-1*38k0dOwQsQhT37-i-MkEVw.png)

To understand the lower half of the graphic, read [this](https://medium.com/@heckerhut/smart-contracts-platforms-and-intermediaries-c3d30f5182a6#.lhx3xzgsx).

#### Bitcoin micro-payment channels as a scalable web service

The sophisticated mix of proven web infrastructure, cryptography and the Bitcoin Blockchain we implemented at SatoshiPay in form of a scalable web service has been known for many years by Bitcoin aficionados under the name [“micro-payment channels”](https://en.bitcoin.it/wiki/Contract#Example_7:_Rapidly-adjusted_.28micro.29payments_to_a_pre-determined_party). The key features of which are:

1.  [2-out-of-2 multi-signature addresses](https://en.bitcoin.it/wiki/Multisignature#Multisigniture_Addresses) and
2.  the [nLockTime](https://en.bitcoin.it/wiki/NLockTime) property.

Combining those features enables us to act as a trustless intermediary between buyers and sellers of digital goods. More specifically, we employ three distinct transaction types to offer our service in a trustless manner:

**Commitment Transaction  
**The commitment transaction specifies the maximum amount of bitcoins a buyer is going to spend in a single “session” (also called a “channel”). The commitment transaction sends the specified amount from the buyer’s wallet to a 2-out-of-2 multi-signature address, based on the buyer’s and seller’s public key. The effect of which is, that only together buyer and seller can move any of the committed funds (in the world of legacy banking, this is called a joint account with the option ‘both or all to sign’). The maximum duration of a session is specified by the nLockTime property attached to the refund transaction (see below).

**Payment Transaction  
**The payment transaction is constantly re-negotiated between the parties, thereby incrementally transferring some of the committed bitcoins from the multi-signature address to the seller. Over the course of a session, the amount transferred from buyer to seller can increase in arbitrarily small steps, thereby enabling what we call **nano-payments** of as little as 1 satoshi (~0.000004 USD at the time of writing). Since only the very last payment transaction of a complete payment session is ever published to the Bitcoin blockchain, our service is detached from Bitcoin’s current scalability problems to a major extent.

**Refund Transaction  
**The refund transaction is the buyer’s insurance policy: before the buyer actually commits any funds to the multi-signature address, the seller signs a transactions that transfers all of the yet-to-be-committed funds back to the buyer. Should the seller disappear after commitment, the buyer can get his money back, provided that the refund transaction’s lock-time has expired.

#### Machine-to-Machine Payments

Admittedly, it would be a bit much to require the end-users of our service to understand all the technical nitty-gritty. Quite the contrary, one of our main goals was to design a completely frictionless experience for the users of our service, thereby increasing our publishers conversion rate.

So instead of teaching users how to negotiate and perform on Bitcoin-based Smart Contracts, we are teaching their browsers how to do it. Consequently, we’ve built a cutting-edge **machine-to-machine payment platform**. And thanks to Bitcoin, every step of the way can be completely automated, relieving end-users from the requirement to understand what’s happening at the technical layer.

Thinking of the emerging Internet of Things, this seems like a good idea. Now, if only [the law](https://twitter.com/heckerhut/status/649893759891709952) is catching up quickly enough...

#### Involving humans in negotiation and performance through UX: Or how to reduce mental transaction cost while keeping the user in control

Enabling browsers to become autonomous agents that negotiate and perform on contracts for their users, naturally raises the question of how much control should rest with the user and how much should actually be automated. To complicate matters further, micro-payments are plagued by what Szabo calls [“mental transaction cost”](http://szabo.best.vwh.net/micropayments.html), i.e. the cognitive overhead for users to constantly evaluate if they want a certain transaction to be performed or not.

At SatoshiPay, we’ve realized early on that this is a serious problem that needs solving. So that’s what we did. Our solution consists of multiple steps:

1.  No sign-up or login for end-users to start paying with our service.
2.  Users don’t have to understand our tech. Instead, we teach their browsers.
3.  Users determine initially the maximum amount of money they are willing to spend in an individual session.
4.  By enabling individual payments as low as 1 satoshi (~0.000004 USD) we encourage our publishers to sell content for really tiny amounts, so that users do not have to regret a singular purchase-decision.
5.  A payment is performed by a single click or tap, nothing more.
6.  Instant feedback: a one-click purchase leads to the immediate delivery of the desired product. Moreover, we provide a visual overview of our users funds in form of an abstract progress-bar. No complicated text or numbers to parse.
7.  Auto-pay: users can enable “auto-pay mode”, thereby letting their browser take full control if they wish.

#### Challenges we faced when building SatoshiPay

When we started building SatoshiPay, there was no working implementation of Bitcoin micro-payment channels available for web browsers. Only Mike Hearn’s BitcoinJ implementation contained some mention of it, though Java obviously didn’t cut it. So we went ahead and built our own implementation of the micro-payment channel protocol in Javascript. It was great fun and [we won some laurels along the way](https://blog.coinbase.com/2015/07/02/coinbase-announces-winners-of-bithack-v2/).

Another major headache was the lack of reliable Blockchain infrastructure. Virtually every external Blockchain API we tried failed at some point, leaving us with no choice but to build it ourselves. Now we’re running a redundant number of bitcoind nodes, which ensures reliable read/write access to the Blockchain.

#### Intrigued?

Test our service now at [satoshipay.io](https://satoshipay.io) or [signup](https://dashboard.satoshipay.io/sign-up) to our publisher platform to monetize your own content within minutes.

* * *

Footnotes

\[1\] In late 2013, [Ethereum](https://en.wikipedia.org/wiki/Ethereum) happened. In an attempt to honor the visionary work of Szabo, Ethereum’s original inventor [Vitalik Buterin](https://twitter.com/VitalikButerin) named the programs running on Ethereum’s distributed virtual machine _Smart Contracts,_ despite them having nothing much to do with the original vision of Szabo. [In a friendly move](https://www.youtube.com/watch?v=7Y3fWXA6d5k&feature=youtu.be&list=PLJqWcTqh_zKHQUFX4IaVjWjfT2tbS4NVk&t=639), Szabo now embraces both definitions of smart contracts, the original one being a direct analog to traditional, paper-based legal contracts and the “new one” describing long-lived processes running on a trustless, distributed virtual machine. **In this essay I stick to Szabo’s original definition of Smart Contracts.**

\[2\] Our backend is comprised of a multitude of micro-services written in NodeJS, deployed as Docker containers, orchestrated by [Tutum](http://tutum.co). Our paywall widget uses websockets to talk to our backend.

\[3\] Trust, of course, is not “0 or 1” but a spectrum. More specifically, SatoshiPay still is a trusted code-delivery platform.

By [Florian Glatz](https://medium.com/@heckerhut) on [February 1, 2016](https://medium.com/p/777988a868d).

[Canonical link](https://medium.com/@heckerhut/how-we-use-smart-contracts-at-satoshipay-to-change-the-internet-s-economy-forever-today-777988a868d)

Exported from [Medium](https://medium.com) on January 3, 2025.