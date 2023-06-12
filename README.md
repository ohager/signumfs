# SignumFS

A simple on-chain file storage solution for the best [unknown blockchain platform](https://signum.network).

---

## STILL WORK IN PROGRESS - not available yet

---

## Motivation

The Signum blockchain is capable of storing arbitrary data on-chain. Each transaction can carry up to 1000 bytes of data.
So, why not splitting files into multiple transactions and store them on-chain?

Mind, that the data is publicly available and (at current time of writing) no additional encryption is considered.
Data can be compressed (using Brotli) optionally, but also keep in mind, that most media types are already compressed efficiently.
Compression makes sense for textual data.

## Limits and Considerations

As space is a valuable resource on blockchain certain costs are involved: ~0.06 SIGNA/kB
Furthermore, upload file size is limited to 5 MiB at the moment,
resulting in 5,243 transactions à 0.06 SIGNA + 1 transaction à 0.02 SIGNA, summing up to 314.60 SIGNA.
To not congest the chain the maximum amount of transactions per block is set to 128.
So, full 5 MiB would be split into 41 Blocks each taking in avg. 4 minutes until confirmed.
So taking ~164 Minutes until the entire file is confirmed by the network.

## Installation

> Requires Node 16+ installed

Just run `npm i signumfs -g`

## Usage

`signumfs --help` to get more info

// TODO
