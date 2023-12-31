[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=bugs)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ohager_signumfs&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ohager_signumfs)

# SignumFS

A simple on-chain file storage solution for the best [unknown blockchain platform](https://signum.network).

## Motivation

The Signum blockchain is capable of storing arbitrary data on-chain. Each transaction can carry up to 1000 bytes of data.
So, why not splitting files into multiple transactions and store them on-chain?

Mind, that the data is publicly available and (at current time of writing) no additional encryption is considered.
Data can be compressed (using Brotli) optionally, but also keep in mind, that most media types are already compressed efficiently.
Compression makes sense for textual data.

## Installation

> Requires Node 16+ installed

Just run `npm i signumfs -g`

## CLI Usage

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
  Version: 1.0.1


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

> Credits to [CurbShifter](https://github.com/CurbShifter) who inspired me for this tool. He did something similar back in 2018

### Profile

Before you start you need to create your profile, i.e. storing your account data and set node url
Just run `signumfs profile init` and follow the guides

You can always `reset` and `show` your profile.

### Files

At this moment, only three simple commands are available

#### Upload

> Consider the [limitations](#limits-and-considerations) and also the [Disclaimer](#disclaimer)

```
Usage: signumfs upload|up [options]

Upload a file

Options:
-t, --try            Runs without creating anything on chain. Good for testing purposes and checking costs
-f, --file <string>  Filename to upload
-x, --compress       Compress data before upload
-h, --help           display help for command
```

Example:

Uploads an image. Compression usually makes no sense, unless it's SVG

```bash
signumfs up -f ohager_avatar.png

? Enter your PIN [hidden]
✔ Uploaded Successfully
┌──────────┬────────────────────────┐
│ (index)  │         Values         │
├──────────┼────────────────────────┤
│   fee    │         '4.47'         │
│  fileId  │ '12973307999043577690' │
│  chunks  │           79           │
│ uploaded │      '76.38 KiB'       │
└──────────┴────────────────────────┘
```

Uploads a file with compression on. Text files can be dramatically reduced in size (>50% is not rare)!

```bash
signumfs up -f sometextfile.md -x
```

#### Download

```
Usage: signumfs download|dl [options]

Download a file

Options:
  -f, --fileId <string>   File Chain Id
  -o, --outfile <string>  Custom File Name
  -h, --help              display help for command
```

**Examples**

Simple download

```bash
signumfs download --fileId 12973307999043577690
? Enter your PIN [hidden]
✔ Downloaded Successfully
File saved under: ohager_bat.png
```

Downloads to a custom file name

```bash
signumfs dl -f 12973307999043577690 -o ohager_signum_avatar.png
? Enter your PIN [hidden]
✔ Downloaded Successfully
File saved under: /home/ohager/Pictures/ohager_signum_avatar.png
```

### List Files

```
Usage: signumfs list|ls [options]

List all uploaded files

Options:
  -a, --account <string>  Account Id, Address, or alias. If not given your own profile account is considered (default: "")
  -h, --help              display help for command
```

**Examples**

List your own files

```bash
signumfs ls
? Enter your PIN [hidden]
✔ Fetched 1 file records for 9K9L-4CB5-88Y5-F5G4Z
┌─────────┬────────────────────────┬──────────────────┬───────┬──────┬────────┬────────────┬─────────────────────────┐
│ (index) │         fileId         │       name       │ size  │ fee  │ chunks │ compressed │         sha512          │
├─────────┼────────────────────────┼──────────────────┼───────┼──────┼────────┼────────────┼─────────────────────────┤
│    0    │ '12973307999043577690' │ 'ohager_bat.png' │ 78215 │ 4.46 │   79   │    '-'     │ '2b26642e30…a5823809dd' │
└─────────┴────────────────────────┴──────────────────┴───────┴──────┴────────┴────────────┴─────────────────────────┘
```

List files of other accounts - you can use accountIds, addresses and also aliases (with TLD support: `<alias>:<tld>`)

```bash
signumfs ls --account  S-9K9L-4CB5-88Y5-F5G4Z
? Enter your PIN [hidden]
✔ Fetched 1 file records for 9K9L-4CB5-88Y5-F5G4Z
┌─────────┬────────────────────────┬──────────────────┬───────┬──────┬────────┬────────────┬─────────────────────────┐
│ (index) │         fileId         │       name       │ size  │ fee  │ chunks │ compressed │         sha512          │
├─────────┼────────────────────────┼──────────────────┼───────┼──────┼────────┼────────────┼─────────────────────────┤
│    0    │ '12973307999043577690' │ 'ohager_bat.png' │ 78215 │ 4.46 │   79   │    '-'     │ '2b26642e30…a5823809dd' │
└─────────┴────────────────────────┴──────────────────┴───────┴──────┴────────┴────────────┴─────────────────────────┘
```

Using alias with tld

```bash
signumfs ls -a nostrd00d:nostr
? Enter your PIN [hidden]
✔ Fetched 1 file records for 9K9L-4CB5-88Y5-F5G4Z
┌─────────┬────────────────────────┬──────────────────┬───────┬──────┬────────┬────────────┬─────────────────────────┐
│ (index) │         fileId         │       name       │ size  │ fee  │ chunks │ compressed │         sha512          │
├─────────┼────────────────────────┼──────────────────┼───────┼──────┼────────┼────────────┼─────────────────────────┤
│    0    │ '12973307999043577690' │ 'ohager_bat.png' │ 78215 │ 4.46 │   79   │    '-'     │ '2b26642e30…a5823809dd' │
└─────────┴────────────────────────┴──────────────────┴───────┴──────┴────────┴────────────┴─────────────────────────┘
```

## API Usage

You can use the `SignumFS` class programmatically, having three methods

- `uploadFile`
- `downloadFile`
- `listFiles`

```ts
const fs = new SignumFS({
  dryRun: false,
  seed: "<your_seed>",
  nodeHost: "https://localhost:8125",
});

// saves from ledger into ./myfile.downloaded.txt
const metadata = await fs.downloadFile({
  metadataTransactionId: "1234", // transaction Id of the on-chain metadata
  filePath: "./myfile.downloaded.txt",
});

// uploads file to ledger
const uploadinfo = await fs.uploadFile({
  file: "./myfile.txt",
  shouldCompress: true,
});

// list file records per account
const fileRecords = await fs.uploadFile("<accountId>");
```

> See more in the [API Doc](https://ohager.github.io/signumfs/)

## Limits and Considerations

As space is a valuable resource on blockchain certain costs are involved: ~0.06 SIGNA/kB
Furthermore, upload file size is limited to 1 MiB at the moment,
resulting in 1,057 transactions à 0.06 SIGNA + 1 transaction à 0.02 SIGNA, summing up to 63.44 SIGNA.
To not congest the chain the maximum amount of transactions per block is set to 160 per default.
So, full 1 MiB would be split into 7 Blocks each taking in avg. 4 minutes until confirmed.
So taking ~28 Minutes until the entire file is confirmed by the network.

### Local Node

Although you could use public nodes to upload, you should always use a local node:

- faster
- more stable
- allow custom config

#### Configuration

When uploading larger files you might hit a limit on maximum referenced transactions reached:

```
[INFO] 2023-06-14 09:23:45 brs.unconfirmedtransactions.UnconfirmedTransactionStoreImpl - Transaction -3662528926404861624: Not added because too many transactions with referenced full hash
```

The default value is 5% of 8192 (cache transaction limit), which is about 400 references. The block splitting uses referenced transactions,
so you might end up hitting the limit on a 1 MiB file. You can raise the limit in your configuration file:

```
P2P.maxUnconfirmedTransactionsFullHashReferencePercentage=15
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
