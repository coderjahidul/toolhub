export type ToolCategory = "image" | "pdf" | "developer";

export type ToolInput = "image" | "pdf" | "pdf-multi" | "json" | "password";

export type ToolFaq = {
  question: string;
  answer: string;
};

export type ToolSection = {
  heading: string;
  paragraphs: string[];
};

export type ToolDefinition = {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  summary: string;
  keywords: string[];
  steps: string[];
  sections: ToolSection[];
  faq: ToolFaq[];
  related: string[];
  processing: "server" | "client";
  input: ToolInput;
  accept?: string;
  endpoint?: string;
  maxBytes?: number;
};

export type CategoryDefinition = {
  slug: ToolCategory;
  name: string;
  blurb: string;
};

export const categories: CategoryDefinition[] = [
  {
    slug: "image",
    name: "Image Tools",
    blurb: "Compress, convert, and resize JPG, PNG, WebP, and GIF files, then download the result.",
  },
  {
    slug: "pdf",
    name: "PDF Tools",
    blurb: "Merge several PDFs into one file, or compress a PDF for email and uploads.",
  },
  {
    slug: "developer",
    name: "Developer Tools",
    blurb: "Format JSON and generate passwords locally. These tools never send your text to the server.",
  },
];

const imageAccept = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
const pdfAccept = "application/pdf,.pdf";
const tenMegabytes = 10 * 1024 * 1024;
const twentyMegabytes = 20 * 1024 * 1024;

export const tools: ToolDefinition[] = [
  {
    slug: "image-compressor",
    name: "Image Compressor",
    category: "image",
    description:
      "Reduce JPG, PNG, WebP, and GIF file size. Free image compressor with a quality slider and a 10 MB limit.",
    summary:
      "Upload a single image and download a smaller copy. JPEG and WebP follow the quality slider. PNG files below a quality of 80 use a color palette so they shrink more. Files are processed for this download and are not stored.",
    keywords: ["image compressor", "compress jpg", "reduce image size", "webp compressor"],
    steps: [
      "Drop a JPG, PNG, WebP, or GIF up to 10 MB.",
      "Set the quality. Lower values make smaller files.",
      "Download the compressed image. The daily free limit is 20 server operations.",
    ],
    sections: [
      {
        heading: "What image compression changes",
        paragraphs: [
          "Compression rewrites the picture so the file weighs less. JPG and WebP can drop detail that is hard to see. PNG stays lossless at high quality and, below a quality of 80, switches to a smaller color palette.",
          "The pixel width and height stay the same. If the photo is still too large for the page, resize it first, then compress. A 4000 pixel photo does not get smaller in dimensions here.",
        ],
      },
      {
        heading: "How to choose a quality",
        paragraphs: [
          "Start near 80 for a photo. Check faces, text, and flat skies at full zoom. Raise the quality if you see blocks. Lower it only when the picture still looks clean and the file is too heavy.",
          "Logos and screenshots usually stay PNG. Photos can go further as JPG or WebP. Each new save of a JPG throws away a little more, so compress from the original once.",
        ],
      },
    ],
    faq: [
      {
        question: "Which formats can I compress?",
        answer: "JPG, PNG, WebP, and single-frame GIF. Animated images are rejected.",
      },
      {
        question: "Does a lower quality always make a smaller file?",
        answer: "For JPG and WebP, yes, until the picture is already very small. A PNG of a photo often shrinks more if you convert it to JPG or WebP instead of only lowering quality.",
      },
      {
        question: "What is the size limit?",
        answer: "10 MB per image. Signed-in results can be saved. Anonymous uploads are deleted with the temporary files.",
      },
      {
        question: "Are uploads saved?",
        answer: "No. The API writes a temp file, returns the download, and a scheduled command deletes leftovers.",
      },
    ],
    related: ["image-converter", "image-resizer", "pdf-compress"],
    processing: "server",
    input: "image",
    accept: imageAccept,
    endpoint: "/api/v1/image/compress",
    maxBytes: tenMegabytes,
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    category: "image",
    description:
      "Convert images between JPG, PNG, WebP, and GIF. Free online image converter with a 10 MB upload limit.",
    summary:
      "Change the format without a desktop app. WebP is a strong choice for pages that need smaller photos. GIF output is a single frame. The original file is not kept after the response is sent.",
    keywords: ["image converter", "jpg to webp", "png to jpg", "webp converter"],
    steps: [
      "Upload one image.",
      "Pick JPG, PNG, WebP, or GIF.",
      "Download the converted file.",
    ],
    sections: [
      {
        heading: "Which format to pick",
        paragraphs: [
          "JPG is the usual choice for photographs that do not need a transparent background. PNG keeps sharp edges and transparency. WebP is smaller than JPG for many photos and can also keep transparency.",
          "GIF output here is a single frame. Use it only when a site or an old tool still asks for GIF. For a logo you will edit again, keep a PNG master and convert a copy for the page.",
        ],
      },
      {
        heading: "What conversion does not fix",
        paragraphs: [
          "Changing the format does not resize the picture or remove extra pixels. A huge PNG converted to JPG is still huge in dimensions. Resize first when the layout only needs a smaller image, then convert or compress.",
          "The upload limit is 10 MB. The result keeps one frame. Animated files are rejected so a multi-frame GIF is not silently flattened without you noticing.",
        ],
      },
    ],
    faq: [
      {
        question: "Will a PNG keep its transparency as JPG?",
        answer: "JPG has no alpha channel, so transparent pixels become a flat background. Use PNG or WebP when you need transparency.",
      },
      {
        question: "Can I convert an animated GIF?",
        answer: "No. This tool accepts single-frame images only.",
      },
      {
        question: "Should I convert before or after resize?",
        answer: "Resize first when the source is larger than the page needs. Then convert. That order throws away pixels you will never display.",
      },
      {
        question: "Is the original file kept?",
        answer: "No. The converter returns a new file and does not store the upload for anonymous visitors.",
      },
    ],
    related: ["image-compressor", "image-resizer", "json-formatter"],
    processing: "server",
    input: "image",
    accept: imageAccept,
    endpoint: "/api/v1/image/convert",
    maxBytes: tenMegabytes,
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    category: "image",
    description:
      "Resize images by pixels or percent. Keep the aspect ratio, or set an exact width and height.",
    summary:
      "Set a width, a height, or a percent of the original size. Aspect ratio stays locked unless you turn it off and provide both dimensions. Output keeps the source format. Each side must stay within 8000 pixels.",
    keywords: ["image resizer", "resize jpg", "change image dimensions", "scale image"],
    steps: [
      "Upload an image up to 10 MB and 10000 pixels on each side.",
      "Enter pixels or a percent.",
      "Download the resized image.",
    ],
    sections: [
      {
        heading: "What image resizing is",
        paragraphs: [
          "Resizing changes how many pixels wide and tall the picture is. It does not, by itself, pick a new file format. The download keeps the source format. Compress afterwards if the file is still heavy.",
          "Leave aspect ratio on unless you need a stretched result. Setting only the width, or only the height, scales the other side so faces and logos stay in proportion.",
        ],
      },
      {
        heading: "Useful pixel sizes",
        paragraphs: [
          "A blog column around 800 pixels wide looks sharp on a dense screen at about 1600 pixels. A full-width hero is often 1600 to 2400 pixels wide. A thumbnail can be 400 to 800 pixels. Social posts vary: a square post is commonly 1080 by 1080, and a landscape post is often 1200 by 630.",
          "Each side must stay within 8000 pixels. The source can be up to 10000 pixels on a side and 10 MB. Do not enlarge a small image by a large percent if you need it to stay sharp. Extra pixels cannot invent detail that was never there.",
        ],
      },
    ],
    faq: [
      {
        question: "What happens if I only set the width?",
        answer: "The height scales with the width so the photo does not stretch.",
      },
      {
        question: "Can I stretch to an exact box?",
        answer: "Yes. Turn off aspect ratio and set both width and height.",
      },
      {
        question: "Will resizing make the file smaller?",
        answer: "Fewer pixels usually mean a smaller file, but the format still matters. A resized PNG of a photo can stay large. Compress or convert after you have the right dimensions.",
      },
      {
        question: "What is the largest result?",
        answer: "8000 pixels on each side. The upload itself can be up to 10000 pixels on a side and 10 MB.",
      },
    ],
    related: ["image-compressor", "image-converter", "pdf-merge"],
    processing: "server",
    input: "image",
    accept: imageAccept,
    endpoint: "/api/v1/image/resize",
    maxBytes: tenMegabytes,
  },
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    category: "pdf",
    description:
      "Combine two or more PDFs into a single file. Free PDF merger for up to 10 documents.",
    summary:
      "Add PDFs in the order you want them joined. Each file can be up to 20 MB, and the merge stops at 200 pages. The download is named merged.pdf. Nothing is saved to an account.",
    keywords: ["pdf merge", "combine pdf", "merge pdf online", "join pdf"],
    steps: [
      "Add at least two PDF files.",
      "Remove any file you do not want in the packet.",
      "Download the merged PDF.",
    ],
    sections: [
      {
        heading: "When to merge PDFs",
        paragraphs: [
          "Use merge when scans, exports, or signed pages arrived as separate files and the reader should get one packet. The tool joins whole documents. It does not pull a single page out of a file or rewrite the words inside a page.",
          "Put the files in reading order before you start. The download follows the list from top to bottom and is named merged.pdf.",
        ],
      },
      {
        heading: "Limits to plan for",
        paragraphs: [
          "You can add 2 to 10 PDFs. Each file can be up to 20 MB, and the merge stops at 200 pages in total. A packet over those limits needs to be split into smaller jobs.",
          "If the joined file is too large to email, compress it afterwards. Merging does not shrink photos that are already embedded in the pages.",
        ],
      },
    ],
    faq: [
      {
        question: "How many PDFs can I merge?",
        answer: "Up to 10 files, 20 MB each, and 200 pages in total.",
      },
      {
        question: "Does the order matter?",
        answer: "Yes. Files are merged in the order shown in the list.",
      },
      {
        question: "Can I merge one page from a longer PDF?",
        answer: "No. Each uploaded file is included in full. Remove a file from the list if it should not be in the packet.",
      },
      {
        question: "Is the merged file saved on an account?",
        answer: "No. The download is returned immediately and is not stored on an account.",
      },
    ],
    related: ["pdf-compress", "image-compressor", "image-resizer"],
    processing: "server",
    input: "pdf-multi",
    accept: pdfAccept,
    endpoint: "/api/v1/pdf/merge",
    maxBytes: twentyMegabytes,
  },
  {
    slug: "pdf-compress",
    name: "PDF Compress",
    category: "pdf",
    description:
      "Compress a PDF for email or the web. Choose screen, ebook, or printer quality.",
    summary:
      "Ghostscript rewrites the PDF at the level you pick. Screen is the smallest, printer keeps more detail, and ebook sits in between. The upload limit is 20 MB. The compressed file downloads immediately.",
    keywords: ["pdf compress", "reduce pdf size", "compress pdf online", "smaller pdf"],
    steps: [
      "Upload one PDF up to 20 MB.",
      "Choose screen, ebook, or printer.",
      "Download the smaller PDF.",
    ],
    sections: [
      {
        heading: "What PDF compression targets",
        paragraphs: [
          "Ghostscript rewrites the file at the level you pick. Most of the savings come from photos and scanned images inside the pages. A PDF that is already mostly text may barely change size.",
          "Screen is the smallest and is meant for email. Ebook sits in the middle for ordinary sharing. Printer keeps more detail when the pages still need to look sharp.",
        ],
      },
      {
        heading: "Check the result",
        paragraphs: [
          "Open the download before you send a receipt, a scan, or a contract. If type looks soft, use a higher level or keep the original and send the smaller copy only when the text is still clear.",
          "The upload limit is 20 MB. This tool does not merge files, fill a form, or add a signature. Join pages first if you have several PDFs, then compress the single result.",
        ],
      },
    ],
    faq: [
      {
        question: "Which level should I use?",
        answer: "Use screen for email, ebook for general sharing, and printer when the pages still need to look sharp.",
      },
      {
        question: "Will the text stay selectable?",
        answer: "Yes for normal text PDFs. The rewrite keeps the page content and targets embedded image weight.",
      },
      {
        question: "Why did the file barely shrink?",
        answer: "Text-only PDFs are already compact. Compression helps when the pages contain photos or scans.",
      },
      {
        question: "What is the upload limit?",
        answer: "One PDF up to 20 MB. The compressed file downloads immediately.",
      },
    ],
    related: ["pdf-merge", "image-compressor", "image-converter"],
    processing: "server",
    input: "pdf",
    accept: pdfAccept,
    endpoint: "/api/v1/pdf/compress",
    maxBytes: twentyMegabytes,
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    category: "developer",
    description:
      "Format or minify JSON in your browser. The JSON formatter does not upload your text.",
    summary:
      "Paste JSON, then format it with two-space indentation or minify it to one line. Invalid JSON shows a parse error. The work stays on this page, so it does not count toward the daily server limit.",
    keywords: ["json formatter", "json beautifier", "minify json", "json validator"],
    steps: [
      "Paste a JSON object or array.",
      "Choose Format or Minify.",
      "Copy the result.",
    ],
    sections: [
      {
        heading: "Format or minify",
        paragraphs: [
          "Format adds two-space indentation and line breaks so an object or array is easier to read. Minify removes that whitespace and returns one line, which is what many APIs and build steps expect.",
          "Neither action changes the data. Keys, numbers, and strings stay the same. Invalid JSON stops with a parse error instead of guessing a fix.",
        ],
      },
      {
        heading: "It stays in the browser",
        paragraphs: [
          "Parsing uses JSON.parse on this page. The text is not uploaded, and the action does not count toward the 20 server operations a day.",
          "Do not paste tokens or production secrets into a shared computer. The formatter does not store the text, but the browser tab can still be seen by anyone at the screen.",
        ],
      },
    ],
    faq: [
      {
        question: "Is my JSON sent to a server?",
        answer: "No. Parsing uses JSON.parse in the browser.",
      },
      {
        question: "Does this count as a daily operation?",
        answer: "No. Only image and PDF tools use the 20 operations per day limit.",
      },
      {
        question: "Will format sort my keys?",
        answer: "No. Key order stays as pasted. Only whitespace changes.",
      },
      {
        question: "What if the JSON is invalid?",
        answer: "The page shows a parse error and does not invent a corrected document.",
      },
    ],
    related: ["password-generator", "image-converter", "pdf-merge"],
    processing: "client",
    input: "json",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "developer",
    description:
      "Generate a random password, passphrase, PIN, or alphanumeric code in the browser.",
    summary:
      "Choose Random, Passphrase, PIN, or Alphanumeric. Values come from crypto.getRandomValues, and nothing is sent to ToolHub.",
    keywords: ["password generator", "random password", "passphrase generator", "pin generator"],
    steps: [
      "Pick a format: Random, Passphrase, PIN, or Alphanumeric.",
      "Set the length or word count.",
      "Generate a password and copy it into your password manager.",
    ],
    sections: [
      {
        heading: "Which format to generate",
        paragraphs: [
          "Random mixes letters, numbers, and symbols. Use it when the site accepts symbols. A passphrase is several words, which is easier to type on a phone. A PIN is digits only. Alphanumeric skips symbols for forms that reject them.",
          "Longer is safer for a password you will store in a manager. A short PIN is only appropriate where the service itself asks for digits, such as a device code.",
        ],
      },
      {
        heading: "Nothing is uploaded",
        paragraphs: [
          "Values come from crypto.getRandomValues in the browser. The generator does not send the password to ToolHub and does not log it.",
          "Copy the result into a password manager and generate a new one for each account. Reusing a password across sites is the usual way one leak becomes many.",
        ],
      },
    ],
    faq: [
      {
        question: "Which format should I use?",
        answer:
          "Random is a mixed character password. A passphrase is easier to type. A PIN is digits only. Alphanumeric skips symbols for sites that reject them.",
      },
      {
        question: "How random is the password?",
        answer: "Each character or word is chosen with the Web Crypto API, with rejection sampling so the modulo does not bias the result.",
      },
      {
        question: "Do you store generated passwords?",
        answer: "No. Generation happens locally and nothing is logged.",
      },
    ],
    related: ["json-formatter", "image-compressor", "pdf-compress"],
    processing: "client",
    input: "password",
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function relatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related
    .map((slug) => getTool(slug))
    .filter((item): item is ToolDefinition => item !== undefined);
}

export function toolsInCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}
