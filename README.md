# tekkoh.com

The landing page for Tekkoh, a private journal for iPhone. Static HTML and
CSS in `site/`, no build step. Netlify publishes `site/` on every push to
`main` (see `netlify.toml`).

- `site/index.html`: the page.
- `site/security.html`: the security notes in plain language, condensed
  from the app's `SECURITY.md`. Keep the two in step.
- `site/img/`: screenshots of a made-up demo journal (from a local,
  uncommitted demo build of the app), and the widget renders.
- `site/draw.js`: starts the ensō's brush animation (the drawing is CSS).
- `site/setup.txt`: instructions a person hands their agent ("Follow the
  instructions at https://tekkoh.com/setup.txt to set up tekkoh").
- `site/link.html`, `site/link.js`: where an agent's one-time link
  (`/link#s=…&k=…&n=…`) lands when it doesn't open the app: an "Open in
  Tekkoh" button (`tekkoh://link#…`) on an iPhone, a QR code of the link
  elsewhere. It follows the link's state (`GET /v1/pair/:slot/state` on
  tekkoh.cronbon.com); the key in the fragment never leaves the page. `site/vendor/qrcode.js`
  is Kazuhiko Arase's MIT QR encoder, as in tekkoh-web.
- `site/.well-known/apple-app-site-association`: makes `/link` a Universal
  Link into the app (Artifact's team TVA9Z8LD95,
  `com.artifact.tekkoh`; the earlier `U6U9XP94Z7.io.singleton.tekkoh` stays
  listed while phones move over).
- `site/dl/`: the `tekkoh` CLI for Linux, built from `cmd/tekkoh` in
  arfct/tekkoh. When you rebuild, update the checksums in `setup.txt`
  and `dl/SHA256SUMS` along with the commit and Go version.

Preview locally with `python3 -m http.server -d site`. Each pull request also
gets a Netlify deploy preview; merging to `main` publishes.

The previous version of the site, a React app from 2020, isn't part of this
repository.

## License

MIT; see [LICENSE](LICENSE). `site/vendor/qrcode.js` is Kazuhiko Arase's QR
code generator, also MIT, with its notice kept in the file. The app's code
is at [arfct/tekkoh-ios](https://github.com/arfct/tekkoh-ios), and the
server's, the web app's and the CLI's at
[arfct/tekkoh](https://github.com/arfct/tekkoh).
