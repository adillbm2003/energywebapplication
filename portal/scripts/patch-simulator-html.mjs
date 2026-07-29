import fs from 'fs'

const path = 'public/energy-simulator.html'
let html = fs.readFileSync(path, 'utf8')

const embedCss = `html.is-embedded #houseSvg{height:min(520px,55vw);min-height:380px;max-height:540px}
html.is-embedded .house-svgwrap{flex:none}`

const embedBoot = `<script>if(window.parent!==window)document.documentElement.classList.add('is-embedded');</script>`

const embedHeightScript = `
<script>
if (window.parent !== window) {
  let heightTimer;
  const notifyHeight = () => {
    clearTimeout(heightTimer);
    heightTimer = setTimeout(() => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
      );
      parent.postMessage({ type: 'simulator-height', height }, '*');
    }, 150);
  };
  window.addEventListener('load', notifyHeight);
  window.addEventListener('resize', notifyHeight);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(notifyHeight).observe(document.body);
  }
  notifyHeight();
}
</script>`

if (!html.includes('is-embedded')) {
  html = html.replace(
    '#houseSvg{display:block;height:calc(100vh - 252px);min-height:430px;width:auto;max-width:100%;margin:0 auto;overflow:visible}',
    '#houseSvg{display:block;height:calc(100vh - 252px);min-height:430px;width:auto;max-width:100%;margin:0 auto;overflow:visible}\n' + embedCss,
  )
}

if (!html.includes('classList.add(\'is-embedded\')')) {
  html = html.replace('<body>', `<body>\n${embedBoot}`)
}

if (!html.includes('jspdf.umd.min.js') && html.includes('</head>')) {
  html = html.replace(
    '</head>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>\n</head>',
  )
}

html = html.replace(
  /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js"><\/script>\s*(?=<script>\s*if \(window\.parent)/,
  '',
)

if (html.includes('simulator-height')) {
  html = html.replace(
    /<script>\s*if \(window\.parent !== window\) \{[\s\S]*?simulator-height[\s\S]*?\}\s*<\/script>/,
    embedHeightScript.trim(),
  )
} else {
  html = html.replace('</body>', `${embedHeightScript}</body>`)
}

fs.writeFileSync(path, html, 'utf8')
console.log('Patched energy-simulator.html for iframe embed')
