<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $posts = $this->posts();
        $latest = count($posts) - 1;
        foreach ($posts as $index => $post) {
            $post['published_at'] = now()->subMinutes($latest - $index);
            Blog::query()->updateOrCreate(['slug' => $post['slug']], $post);
        }
    }

    private function posts(): array
    {
        return [
            [
                'slug' => 'jpg-vs-png',
                'title' => 'JPG vs PNG: which format should you use?',
                'excerpt' => 'JPG is smaller for photos. PNG keeps sharp edges and transparency. Here is how to choose before you upload.',
                'category' => 'image',
                'body' => <<<'MD'
## Start with the picture, not the file extension

JPG and PNG solve different problems. A photo of a room, a product shot, or a portrait is usually a JPG. A logo, an icon, a screenshot, or any graphic with text and flat color is usually a PNG. Picking the wrong one makes the file larger, or makes edges look fuzzy.

## When JPG is the better choice

JPG (also written JPEG) is built for photographs. It throws away detail your eye is unlikely to notice, which is why a camera photo can shrink from several megabytes to a few hundred kilobytes. Use it for:

- Photos and realistic images
- Blog hero images and product galleries
- Pictures that do not need a transparent background

The tradeoff is quality. Each save recompresses the image. Export once from the original, at a quality around 75 to 85, instead of opening and saving the same JPG again and again. ToolHub’s [image compressor](/tool/image-compressor) does that in the browser upload and returns a new file without keeping the original on the server for anonymous visitors.

## When PNG is the better choice

PNG is lossless. Edges stay sharp, and you can keep a transparent background. That matters for logos on a colored header, UI icons, and screenshots where small text must stay readable. A PNG of a photo is often several times larger than a JPG of the same picture, so do not use PNG as a default for every camera image.

## A simple rule

1. If you can see a real-world scene, export JPG.
2. If you need transparency or crisp text, export PNG.
3. If the site supports newer formats, also make a WebP or AVIF copy for the page, and keep the JPG or PNG as the fallback.

You can switch between these formats with the [image converter](/tool/image-converter). If the dimensions are also wrong for the layout, resize first with the [image resizer](/tool/image-resizer), then compress.
MD,
            ],
            [
                'slug' => 'how-to-compress-images',
                'title' => 'How to compress images without ruining them',
                'excerpt' => 'Resize to the size the page actually shows, then compress. Most of the savings come from those two steps.',
                'category' => 'image',
                'body' => <<<'MD'
## Size the image for the page

Compression works best after you remove pixels you will never display. A 4000 pixel wide photo inside a 800 pixel column still downloads the large file. Resize to about twice the display width if you want a sharp result on high-density screens, then compress. The [image resizer](/tool/image-resizer) accepts a target width and height and keeps the picture in proportion when you change one side.

## Pick a quality, then look at the picture

For JPG and WebP, quality is a scale, not a switch. Start near 80. Zoom to 100 percent and check faces, text, and flat skies. If you see blocks or smears, raise the quality. If the file is still heavy and the picture looks clean, lower it a little. PNG does not use the same quality slider. To make a PNG smaller, reduce the pixel dimensions or convert a photo to JPG or WebP.

## What to check before you upload

- Keep the original somewhere else. Compression is not a substitute for your source file.
- Stay under the upload limit. ToolHub accepts images up to 10 MB.
- Match the format to the content. Photos compress further as JPG or WebP. Logos usually stay PNG.
- Strip nothing you still need. The compressor returns a new image for download. It does not edit the words in the picture.

Open the [image compressor](/tool/image-compressor), drop the file, choose the quality, and download the result. Signed-in accounts can find that download again under Saved files. Anonymous uploads are deleted with the temporary files and are not listed on an account.

## After the file is smaller

Serve one image per layout when you can, and prefer WebP or AVIF for browsers that support them. The guides on [WebP](/blog/webp-guide) and [AVIF](/blog/avif-guide) cover when those formats are worth the extra export.
MD,
            ],
            [
                'slug' => 'best-pdf-tools',
                'title' => 'Best free PDF tools for everyday files',
                'excerpt' => 'Most PDF jobs are merge, compress, or export. You do not need a full editor for those three.',
                'category' => 'pdf',
                'body' => <<<'MD'
## Merge when the packet is split

Scans, signed pages, and exports from different apps often arrive as separate PDFs. Merging puts them in one file in the order you choose. Use the [PDF merge](/tool/pdf-merge) tool for 2 to 10 PDFs. The combined file can include up to 200 pages. Put the pages in the order readers should see them before you upload, because the tool follows that sequence.

## Compress when email or a form rejects the file

A PDF is large when it contains photos, scanned pages, or uncompressed images. Compressing rewrites those images at a lower size. Text-only PDFs are already small, so the savings there are modest. The [PDF compressor](/tool/pdf-compress) accepts a file up to 20 MB and returns a smaller PDF when the content can be reduced.

Check the result before you send it. Receipts and contracts should stay readable. If a scan looks soft, compress less or keep the original for your records and send the smaller copy.

## What these tools do not do

ToolHub’s PDF tools combine files and reduce file size. They do not fill forms, add a signature, or edit a paragraph inside the PDF. For that you still want a dedicated editor. For a packet you only need to join or shrink, a small tool is faster and keeps the file on a short-lived temporary disk.

## A practical order

1. Merge the pages into one document.
2. Compress the merged file if it is too large to send.
3. Download and open it once to confirm the page order and that the text is still clear.

Image files that will later go into a PDF should be resized and compressed first. A huge PNG dropped into a page is the usual reason a “simple” PDF becomes too big to email.
MD,
            ],
            [
                'slug' => 'webp-guide',
                'title' => 'WebP guide: when to use it on a website',
                'excerpt' => 'WebP is a practical default for photos and many graphics. Keep a JPG or PNG fallback if you still support older clients.',
                'category' => 'image',
                'body' => <<<'MD'
## What WebP is good at

WebP is an image format made for the web. A photo saved as WebP is often smaller than the same photo saved as JPG at a similar visual quality. WebP can also store transparency, which JPG cannot, so it sometimes replaces a large PNG as well.

Current versions of Chrome, Edge, Firefox, and Safari display WebP. That covers the browsers most visitors use. If you still have a specific old client to support, offer the JPG or PNG as well.

## How to create a WebP

Export from your design tool, or convert an existing JPG or PNG with the [image converter](/tool/image-converter). Then run the WebP through the [image compressor](/tool/image-compressor) if you want a smaller file at a chosen quality. Resize first when the source is larger than the layout needs.

## When to skip it

- You are sending a file to a printer or a tool that only accepts JPG, PNG, or TIFF.
- The image is a screenshot you will edit again. Keep a PNG master and publish WebP.
- The graphic is a simple SVG logo. A vector file is sharper and usually smaller than any bitmap, including WebP.

## A sensible setup

Publish WebP for the page, keep the original master offline, and link the tool pages when you need a one-off conversion. For a newer and sometimes smaller option, read the [AVIF guide](/blog/avif-guide). AVIF can beat WebP on photos, but encoding is slower and a few workflows still prefer WebP for compatibility.
MD,
            ],
            [
                'slug' => 'avif-guide',
                'title' => 'AVIF guide: smaller photos, with a few limits',
                'excerpt' => 'AVIF can make photographs much smaller than JPG. Use it for photos, and keep another format when you need broad editing support.',
                'category' => 'image',
                'body' => <<<'MD'
## Why AVIF shows up in performance guides

AVIF is based on the AV1 video codec. For photographs it often produces a smaller file than JPG or WebP at a comparable look. That helps a homepage, a catalog, and any page where images are most of the download.

Support in current desktop and mobile browsers is good. Very old browsers will not show an AVIF image, so production sites usually provide a fallback. For a single download that a person will open locally, a JPG or WebP is the safer handoff.

## How to make one

Convert a JPG or PNG with the [image converter](/tool/image-converter) and choose AVIF. If the result is still larger than you want, lower the quality in the [image compressor](/tool/image-compressor). AVIF has a wide useful range. Do not start at the lowest setting, or fine detail in hair, fabric, and text will disappear.

## Limits to know

- Encoding takes more work than JPG. A one-off conversion is fine. Batch jobs of hundreds of huge images belong on a machine you control.
- Some design tools and older office apps do not open AVIF. Keep a JPG or PNG copy for those people.
- Screenshots and flat UI graphics are often better as PNG or WebP. AVIF’s advantage is photographs.

## Where it fits next to the other formats

Use the [JPG vs PNG](/blog/jpg-vs-png) article to pick the master format. Use this guide when you are publishing a photo and the file size matters. Use the [WebP guide](/blog/webp-guide) when you want a widely supported modern format and do not need the last bit of savings AVIF can offer.
MD,
            ],
            [
                'slug' => 'how-to-resize-an-image',
                'title' => 'How to resize an image for a page',
                'excerpt' => 'Set the pixel size the layout needs, keep the proportions, then compress. Enlarging a small file will not make it sharper.',
                'category' => 'image',
                'body' => <<<'MD'
## Match the layout, not the camera

A phone photo is often 3000 to 4000 pixels wide. A blog column may only show 800. The extra pixels still download. Resize to the size the page displays, or about twice that width if you want a sharp result on a high-density screen.

The [image resizer](/tool/image-resizer) takes a width, a height, or a percent. Leave the aspect ratio on so a portrait does not stretch. Set one side and let the other follow.

## Sizes that cover most pages

- A content image: 1200 to 1600 pixels wide
- A full-width banner: 1600 to 2400 pixels wide
- A thumbnail: 400 to 800 pixels wide
- A square post: 1080 by 1080

Stay under 8000 pixels on each side. That is the largest result this resizer will write. The upload can be up to 10 MB and 10000 pixels on a side.

## Resize, then compress

Fewer pixels usually mean a smaller file, but a PNG of a photo can stay heavy. After the dimensions are right, run the [image compressor](/tool/image-compressor) or convert a photo to JPG or WebP with the [image converter](/tool/image-converter).

Do not scale a tiny logo up to fill a hero. The new pixels are guesses, and edges look soft. Start from a larger original instead.
MD,
            ],
            [
                'slug' => 'jpg-png-webp-which-file',
                'title' => 'JPG, PNG, or WebP for a download',
                'excerpt' => 'Pick the format from the picture and from the person who will open the file, not from whichever button is first.',
                'category' => 'image',
                'body' => <<<'MD'
## Three practical choices

JPG is for photographs without transparency. PNG is for logos, screenshots, and anything with a transparent background or small text. WebP is a strong file to publish on a page: it is often smaller than JPG and can keep transparency.

If someone will open the file in an older office app or send it to a printer, give them JPG or PNG. WebP is for the website. Keep the master elsewhere.

## A short sequence

1. Decide the format from the picture. Photos go to JPG or WebP. Graphics with text stay PNG until you publish.
2. Resize to the pixels the page needs with the [image resizer](/tool/image-resizer).
3. Convert with the [image converter](/tool/image-converter) if the current format is wrong.
4. Compress once from that result. Opening and saving a JPG again and again makes it worse.

The longer notes on [JPG versus PNG](/blog/jpg-vs-png) and [WebP](/blog/webp-guide) cover the tradeoffs if you are choosing a default for a whole site.
MD,
            ],
            [
                'slug' => 'how-to-merge-pdfs',
                'title' => 'How to merge PDFs in the right order',
                'excerpt' => 'Join two to ten PDFs into one file. The page order is the order of the list, and the combined packet stops at 200 pages.',
                'category' => 'pdf',
                'body' => <<<'MD'
## Build the packet before you upload

A merged PDF is only as clear as the order of the files. Put the cover, the body, and the appendix in the sequence a reader should see. The [PDF merge](/tool/pdf-merge) tool follows the list from top to bottom and names the download merged.pdf.

You need at least two PDFs. The limit is 10 files, 20 MB each, and 200 pages altogether. Remove a file from the list if it should not be included. The tool adds each document in full. It does not extract one page from a longer PDF.

## After the files are joined

Open the download and check the page count and the order. If email rejects the size, compress that single file with the [PDF compressor](/tool/pdf-compress). Screen is the smallest level. Printer keeps more detail. Text-only packets often shrink very little, because the weight is usually in photos and scans.

These tools do not fill forms or add a signature. For a packet you only need to join, merging is enough.
MD,
            ],
            [
                'slug' => 'format-or-minify-json',
                'title' => 'When to format JSON and when to minify it',
                'excerpt' => 'Formatting is for reading. Minifying is for sending. Neither should change the data, and neither needs to leave the browser.',
                'category' => 'developer',
                'body' => <<<'MD'
## Two jobs, one document

Formatted JSON uses line breaks and indentation so a person can see objects and arrays. Minified JSON is one line with the extra spaces removed. APIs and some config files want the short form. A code review wants the readable form.

The [JSON formatter](/tool/json-formatter) does both in the browser with JSON.parse. The text is not uploaded, and it does not count toward the daily limit on image and PDF tools. Invalid JSON shows a parse error. The tool does not guess a repair, and it does not sort keys.

## What to avoid pasting

Do not drop production tokens, private keys, or customer records into a shared or public computer. The page does not store the text, but anyone who can see the screen can read it. For a normal config or a sample response, format it, copy the result, and close the tab.

If the document is huge, a local editor is a better place. This page is for a payload you want to read or shrink once.
MD,
            ],
            [
                'slug' => 'pick-a-password-format',
                'title' => 'How to pick a generated password format',
                'excerpt' => 'Use a long random password or a passphrase in a manager. Use a PIN or an alphanumeric code only when the site demands that shape.',
                'category' => 'developer',
                'body' => <<<'MD'
## Match the format to the form

A random password mixes letters, numbers, and symbols. That is the right default when the site accepts symbols and you will store the value in a password manager. A passphrase is several words. It is easier to type on a phone and still long enough if you use enough words.

Choose a PIN only when the service asks for digits, such as a device code. Choose alphanumeric when the form rejects symbols. A shorter code is not a general password. It is a shape the other site forced on you.

## Generate it locally

The [password generator](/tool/password-generator) uses the Web Crypto API in the browser. The result is not sent to ToolHub and is not written to an account. Copy it into a manager, and make a different password for each site. Reusing one password is how a single leak opens every other login.

Nothing on this page replaces a manager. The generator only produces the string. You still have to store it somewhere you control.
MD,
            ],
        ];
    }
}
