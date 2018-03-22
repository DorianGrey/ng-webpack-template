# Stats with webpack 3
```
Emitted assets in /home/linne/Projects/ng-webpack-template/build (displayed gzip sizes refer to compression level=6):
 > Service worker   
./workbox-sw.prod.v2.1.3.js @ 42.14 KB (src) => 13.08 KB (gzip)
./service-worker.js         @ 970 B (src)    => 563 B (gzip)   

 > Scripts   
static/js/vendor.6eb081deabbc.js           @ 519.91 KB (src) => 138.88 KB (gzip)
static/js/bundle.082282995381.js           @ 30.75 KB (src)  => 7.7 KB (gzip)   
static/js/lazy-test.module.a0c8129a4ca3.js @ 2.74 KB (src)   => 1.18 KB (gzip)  
static/js/runtime.d41d8cd98f00.js          @ 1.39 KB (src)   => 788 B (gzip)    

 > Styles   
static/css/bundle.637ea5a15945.css @ 2.59 KB (src) => 1.07 KB (gzip)

 > Source maps   
static/js/vendor.6eb081deabbc.js.map           @ 5.67 MB (src)   => 1.12 MB (gzip) 
./workbox-sw.prod.v2.1.3.js.map                @ 268.65 KB (src) => 65.04 KB (gzip)
static/js/bundle.082282995381.js.map           @ 219.29 KB (src) => 44.29 KB (gzip)
static/js/lazy-test.module.a0c8129a4ca3.js.map @ 27.89 KB (src)  => 6.56 KB (gzip) 
static/js/runtime.d41d8cd98f00.js.map          @ 13.7 KB (src)   => 3.07 KB (gzip) 
static/css/bundle.637ea5a15945.css.map         @ 111 B (src)     => 112 B (gzip)   

 > Favicons   
./favicon.png      @ 135.07 KB (src) => 132.24 KB (gzip)
./favicon96x96.png @ 8.56 KB (src)   => 8.58 KB (gzip)  
./favicon64x64.png @ 4.83 KB (src)   => 4.85 KB (gzip)  
./favicon48x48.png @ 3.19 KB (src)   => 3.21 KB (gzip)  

 > Images   
static/media/testbild.2535197bb4cf.jpg @ 24.2 KB (src) => 22.91 KB (gzip)

 > Others   
./index.html    @ 1.18 KB (src) => 600 B (gzip)
./manifest.json @ 670 B (src)   => 246 B (gzip)

 WARNING  There are 3 assets which exceed the configured size limit of 250 KB. Affected asset(s) marked in yellow.
```

# Stats with webpack 4
```
 N  Emitted assets in /home/linne/Projects/ng-webpack-template/build (displayed gzip sizes refer to compression level=6):
 > Service worker
./precache-manifest.d0a6e04f9920385170cf3c74b47c894f.js @ 810 B (src) => 337 B (gzip)
./service-worker.js                                     @ 301 B (src) => 241 B (gzip)

 > Scripts
static/js/vendor.71735c5de5f4.js           @ 511.83 KB (src) => 132.97 KB (gzip)
static/js/bundle.252734f81b89.js           @ 30.4 KB (src)   => 7.67 KB (gzip)
static/js/lazy-test.module.e3fe784469db.js @ 2.67 KB (src)   => 1.15 KB (gzip)
static/js/runtime.d41d8cd98f00.js          @ 1.87 KB (src)   => 1.02 KB (gzip)

 > Styles
static/css/bundle.4fe7f0e39fc5.css @ 2.59 KB (src) => 1.07 KB (gzip)

 > Source maps
static/js/vendor.71735c5de5f4.js.map           @ 3.11 MB (src)   => 673.11 KB (gzip)
static/js/bundle.252734f81b89.js.map           @ 120.26 KB (src) => 26.48 KB (gzip)
static/js/lazy-test.module.e3fe784469db.js.map @ 15.19 KB (src)  => 4.83 KB (gzip)
static/js/runtime.d41d8cd98f00.js.map          @ 10.34 KB (src)  => 3.41 KB (gzip)
static/css/bundle.4fe7f0e39fc5.css.map         @ 3.41 KB (src)   => 1.43 KB (gzip)

 > Favicons
./favicon.png      @ 135.07 KB (src) => 132.24 KB (gzip)
./favicon96x96.png @ 8.56 KB (src)   => 8.58 KB (gzip)
./favicon64x64.png @ 4.83 KB (src)   => 4.85 KB (gzip)
./favicon48x48.png @ 3.19 KB (src)   => 3.21 KB (gzip)

 > Images
static/media/testbild.2535197bb4cf.jpg @ 24.2 KB (src) => 22.91 KB (gzip)

 > Others
./index.html    @ 992 B (src) => 528 B (gzip)
./manifest.json @ 670 B (src) => 246 B (gzip)

 WARNING  There are 2 assets which exceed the configured size limit of 250 KB. Affected asset(s) marked in yellow.

```