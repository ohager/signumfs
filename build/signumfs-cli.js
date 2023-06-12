"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignumFS = void 0;
var signumfs_1 = require("./signumfs");
Object.defineProperty(exports, "SignumFS", { enumerable: true, get: function () { return signumfs_1.SignumFS; } });
// seed: "gym crumble turn daring twin crawl orphan grief fury conduct cram hold",
//
// (async () => {
//     try{
//
//     const fs = new SignumFS({
//         seed: "***",
//         nodeHost: "http://localhost:6876",
//         dryRun: false,
//         chunksPerBlock: 8,
//     })
//
//     await fs.uploadFile('./test.ico');
//         // const result = await fs.downloadFile('14285717817138105801') // textfile
//         const result = await fs.downloadFile('2784658071228966665') // test.ico
//
//         // console.log(result)
//     }catch(e){
//         console.error(e)
//     }
// })()
