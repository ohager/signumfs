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
Furthermore, upload file size is limited to 2 MiB at the moment,
resulting in 2,098 transactions à 0.06 SIGNA + 1 transaction à 0.02 SIGNA, summing up to 125.90 SIGNA.
To not congest the chain the maximum amount of transactions per block is set to 128.
So, full 2 MiB would be split into 17 Blocks each taking in avg. 4 minutes until confirmed.
So taking ~68 Minutes until the entire file is confirmed by the network.

## Installation

> Requires Node 16+ installed

Just run `npm i signumfs -g`

## Usage

`signumfs --help` to get more info

```
Usage: signumfs [options] [command]


            @@@@@@@@  @@@@@@@
         @@@@@    @@@@@    @@@@@
           @@@  @@@  @@@ @@@@@
    @@@      @@@@@     @@@@       @@@
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@
    @@@       @@@@     @@@@@      @@@
           @@@@  @@@  @@@  @@@
         @@@@@    @@@@@    @@@@@
            @@@@@@@  @@@@@@@@

     SignumFS - Blockchain File Storage

  Author: ohager
  Version: 1.0.0


Options:
  -V, --version          output the version number
  -h, --help             display help for command

Commands:
  upload|up [options]    Upload a file
  download|dl [options]  Download a file
  list|ls [options]      List all uploaded files
  profile
  help [command]         display help for command

```

# Disclaimer

<em>
Please read the following terms and conditions carefully before using the file upload tool for the public blockchain. By using this tool, you acknowledge that you have understood and agreed to the terms outlined below:

**Public Nature of Data**:
The public blockchain operates on a decentralized network where uploaded files become publicly accessible to all users. Any data uploaded using this tool will be visible to anyone accessing the blockchain. Therefore, do not upload any information that you wish to remain private or confidential.

**Prohibited Content**:
You are strictly prohibited from uploading any violent, illegal, or harmful content using this tool. This includes, but is not limited to, explicit material, hate speech, copyrighted content without proper authorization, and any content that violates applicable laws or regulations. The tool must only be used for lawful and ethical purposes.

**No Liability**:
The creator of this software tool cannot be held responsible or liable for any misuse, unauthorized access, or content uploaded by users. You understand and agree that you are solely responsible for the files you upload to the public blockchain. The creator of the software cannot guarantee the accuracy, reliability, or security of the uploaded content.

**"As Is" Basis**:
This software tool is provided "as is" without any warranties or guarantees of any kind, either expressed or implied. The creator of the software does not warrant that the tool will be error-free, secure, or continuously available. Any reliance on the tool and its functionality is at your own risk.

By using this tool, you acknowledge that you have read, understood, and agreed to the terms and conditions outlined in this disclaimer. If you do not agree with any part of this disclaimer, please refrain from using the tool to upload files to the public blockchain.

</em>
