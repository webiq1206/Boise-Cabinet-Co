import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const guardFiles = ["no-public-supplier-names.mjs", "supplier-scan.mjs", "supplier-terms.json"];
const sources = Object.fromEntries(guardFiles.map((name) => [
  `scripts/guards/${name}`, readFileSync(new URL(`../scripts/guards/${name}`, import.meta.url)),
]));

function check(files) {
  const root = mkdtempSync(path.join(tmpdir(), "cabinet-video-guard-"));
  try {
    for (const dir of ["public", ".next/static", ".next/server/app", ".next/server/chunks"]) {
      mkdirSync(path.join(root, dir), { recursive: true });
    }
    for (const [name, value] of Object.entries({ ...sources, ...files })) {
      const destination = path.join(root, name);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, value);
    }
    return spawnSync(process.execPath, [path.join(root, "scripts/guards/no-public-supplier-names.mjs")], {
      encoding: "utf8", timeout: 30000,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const uint32 = (number) => { const value = Buffer.alloc(4); value.writeUInt32BE(number); return value; };
const bytes = (...parts) => Buffer.concat(parts.map((part) => Buffer.isBuffer(part) ? part : Buffer.from(part, "latin1")));
function box(type, ...parts) {
  const payload = bytes(...parts);
  return bytes(uint32(payload.length + 8), type, payload);
}
function extendedBox(type, payload) {
  const size = Buffer.alloc(8);
  size.writeBigUInt64BE(BigInt(payload.length + 16));
  return bytes(uint32(1), type, size, payload);
}
function metadata(tag, text, kind = 1) {
  const value = kind === 2 ? Buffer.from(text, "utf16le").swap16() : Buffer.from(text, "utf8");
  return box("udta", box("meta", uint32(0), box("ilst", box(tag, box("data", uint32(kind), uint32(0), value)))));
}
const avcConfiguration = Buffer.from("014d401fffe10019674d401feca02802dd8088000003000800000301e078c18cb001000568eae2cb20", "hex");
function track({ handler = "vide", handlerName = "VideoHandler", compressorName = "", codec = "avc1", omitHandler = false, count = 1, config = avcConfiguration } = {}) {
  const visual = Buffer.alloc(78);
  const compressor = Buffer.from(compressorName, "utf8");
  visual[42] = compressor.length;
  compressor.copy(visual, 43);
  const sample = box(codec, visual, box("avcC", config));
  return box("trak", box("mdia",
    omitHandler ? Buffer.alloc(0) : box("hdlr", Buffer.alloc(8), handler, Buffer.alloc(12), Buffer.from(handlerName + "\0", "utf8")),
    box("minf", box("stbl", box("stsd", uint32(0), uint32(count), sample))),
  ));
}
function video({ tracks = [track()], tags = [], samples = Buffer.from([0, 255, 12, 255]), extra = [] } = {}) {
  return bytes(box("ftyp", "isom", uint32(0), "isom", "avc1"), box("moov", ...tracks, ...tags), ...extra, box("mdat", samples));
}
function rejected(files, pattern) {
  const result = check(files);
  assert.equal(result.status, 1, result.error?.message || result.stdout);
  assert.match(result.stderr, pattern);
}

test("compressed AVC samples are not public supplier text in any scanned asset location", () => {
  const clip = video({ samples: bytes(Buffer.from([0, 255]), " OSC Tafisa one-source Salice Futura Smove ", Buffer.from([255, 0])) });
  const result = check({
    "public/clip.mp4": clip,
    ".next/standalone/public/clip.mp4": clip,
    ".next/static/media/clip.mp4": clip,
    ".next/standalone/.next/static/media/clip.mp4": clip,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  assert.match(result.stdout, /0 hits/);
});

test("title, comment, and freeform metadata still reject every supplier term", () => {
  for (const term of ["OSC", "Tafisa", "one-source", "onesource", "Salice", "Futura", "Smove"]) {
    for (const tag of ["\xa9nam", "\xa9cmt", "----"]) {
      rejected({ "public/clip.mp4": video({ tags: [metadata(tag, `Cabinet ${term} title`)] }) }, new RegExp(term, "i"));
    }
  }
});

test("UTF-16 metadata is decoded before matching", () => {
  rejected({ "public/clip.mp4": video({ tags: [metadata("\xa9nam", "Cabinet Tafisa title", 2)] }) }, /tafisa/);
  rejected({ "public/clip.mp4": video({ tags: [metadata("\xa9cmt", "OSC", 2)] }) }, /osc/);
});

test("short supplier names in handler and compressor text are scanned", () => {
  for (const entry of [track({ handlerName: "OSC" }), track({ compressorName: "OSC" })]) {
    rejected({ "public/clip.mp4": video({ tracks: [entry] }) }, /osc/);
  }
});

test("unsupported metadata encodings and legacy text metadata fail closed", () => {
  for (const kind of [0, 13, 99]) {
    rejected({ "public/clip.mp4": video({ tags: [metadata("\xa9nam", "OSC", kind)] }) }, /unsupported metadata value type/);
  }
  rejected({ "public/clip.mp4": video({ tags: [box("udta", box("\xa9nam", Buffer.from([0, 3, 0, 0]), "OSC"))] }) }, /unsupported legacy QuickTime text metadata/);
  const invalidText = box("udta", box("meta", uint32(0), box("ilst", box("\xa9nam", box("data", uint32(2), uint32(0), Buffer.from([0]))))));
  rejected({ "public/clip.mp4": video({ tags: [invalidText] }) }, /unreadable video/);
});

test("other movie bytes, including nested mdat and unknown metadata, retain the conservative scan", () => {
  for (const tags of [[box("udta", box("uuid", "Private Tafisa metadata"))], [box("udta", box("mdat", "Private Tafisa metadata"))]]) {
    rejected({ "public/clip.mp4": video({ tags }) }, /tafisa/);
  }
  rejected({ "public/clip.mp4": video({ extra: [box("free", "Private Tafisa metadata")] }) }, /tafisa/);
});

test("public filenames and ordinary public/build text remain guarded", () => {
  rejected({ "public/tafisa-clip.mp4": video() }, /public\/tafisa-clip\.mp4: tafisa/);
  for (const file of ["public/details.txt", ".next/static/details.js", ".next/server/app/page.html", ".next/server/chunks/details.js"]) {
    rejected({ [file]: "Cabinet supplier Salice" }, /salice/);
  }
  rejected({ "public/details.bin": "Cabinet supplier Salice" }, /salice/);
});

test("text, subtitle, audio, unknown, missing, and mislabeled sample tracks fail closed", () => {
  for (const handler of ["text", "subt", "sbtl", "clcp", "meta", "soun", "????"]) {
    rejected({ "public/clip.mp4": video({ tracks: [track(), track({ handler })], samples: Buffer.from("Tafisa subtitle") }) }, /unreadable video.*unsupported track handler/);
  }
  rejected({ "public/clip.mp4": video({ tracks: [track({ omitHandler: true })] }) }, /expected one hdlr/);
  for (const codec of ["wvtt", "stpp", "tx3g", "encv", "????"]) {
    rejected({ "public/clip.mp4": video({ tracks: [track({ codec })] }) }, /unsupported video sample/);
  }
});

test("unsupported fragmented or compressed layouts fail closed", () => {
  for (const type of ["cmov", "mvex"]) {
    rejected({ "public/clip.mp4": video({ tags: [box(type, "opaque")] }) }, /unsupported .* video layout/);
  }
  rejected({ "public/clip.mp4": video({ extra: [box("moof", "opaque")] }) }, /unsupported moof video layout/);
});

test("malformed AVC configuration cannot enable skipping media data", () => {
  const configs = [Buffer.from([1, 66, 0, 31, 255, 225, 0]), avcConfiguration.subarray(0, -1), bytes(avcConfiguration, "Tafisa")];
  for (const config of configs) {
    rejected({ "public/clip.mp4": video({ tracks: [track({ config })] }) }, /unreadable video.*AVC/);
  }
});

test("unrecognized, malformed, and truncated files fail closed", () => {
  const tooLarge = extendedBox("free", Buffer.alloc(0));
  tooLarge.writeBigUInt64BE(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 8);
  const fixtures = [
    Buffer.from("not an MP4"), Buffer.alloc(0), video().subarray(0, -1), bytes(video(), "tail"),
    bytes(uint32(4), "ftyp"), bytes(uint32(1), "ftyp"), bytes(video(), tooLarge),
    video({ tracks: [] }), video({ tracks: [track({ count: 2 })] }),
    video({ tags: [box("udta", bytes(uint32(30), "meta"))] }),
    video({ tags: [metadata("\xa9nam", "x", 2).subarray(0, -1)] }),
  ];
  for (const clip of fixtures) rejected({ "public/clip.mp4": clip }, /unreadable video/);
  const unknownBrand = video();
  unknownBrand.write("????", 8, "latin1");
  unknownBrand.write("????", 16, "latin1");
  unknownBrand.write("????", 20, "latin1");
  rejected({ "public/clip.mp4": unknownBrand }, /unrecognized video file type/);
});

test("bounded extended-size and final size-zero media boxes are supported", () => {
  const ordinary = video();
  const prefix = ordinary.subarray(0, ordinary.length - 12);
  for (const media of [extendedBox("mdat", Buffer.from(" OSC ")), bytes(uint32(0), "mdat", " OSC ")]) {
    const result = check({ "public/clip.mp4": bytes(prefix, media) });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
  }
});
