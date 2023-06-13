export interface SignumFSMetaData {
  vs: 1;
  tp: "FIL"; // other type
  xapp: "SignumFS"; // app name
  nm: string; // file name
  xcmp?: "br"; // is compressed and how?
  xcms?: number; // size compressed
  xsize: number; // size in bytes original
  xchunks: number; // how many chunks
  xid: string; // the starting transaction id
  xsha512: string; // hash over stored on-chain data
}
