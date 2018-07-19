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
>  category  Service worker
./precache-manifest.6a7bd2c5023f163d40eab60580b646ed.js @ 722 B (src) => 307 B (gzip)
./service-worker.js

>  category  Scripts
static/js/vendor.737ffa5e3da4.js           @ 473.46 KB (src) => 124.86 KB (gzip)
static/js/bundle.a83999ec02bc.js           @ 27.85 KB (src)  => 7.43 KB (gzip)
static/js/lazy-test.module.0826f2f4af70.js @ 2.68 KB (src)   => 1.16 KB (gzip)
static/js/runtime.d41d8cd98f00.js          @ 2.25 KB (src)   => 1.16 KB (gzip)

>  category  Styles
static/css/bundle.f98361c9d10c.css @ 2.49 KB (src) => 1.08 KB (gzip)

>  category  Source maps
static/js/vendor.737ffa5e3da4.js.map           @ 2.62 MB (src)   => 625.24 KB (gzip)
static/js/bundle.a83999ec02bc.js.map           @ 115.94 KB (src) => 26.37 KB (gzip)
static/js/lazy-test.module.0826f2f4af70.js.map @ 15.42 KB (src)  => 4.9 KB (gzip)
static/js/runtime.d41d8cd98f00.js.map          @ 11.69 KB (src)  => 3.85 KB (gzip)
static/css/bundle.f98361c9d10c.css.map         @ 3.32 KB (src)   => 1.43 KB (gzip)

>  category  Favicons
./favicon.png      @ 135.07 KB (src) => 132.24 KB (gzip)
./favicon96x96.png @ 8.56 KB (src)   => 8.58 KB (gzip)
./favicon64x64.png @ 4.83 KB (src)   => 4.85 KB (gzip)
./favicon48x48.png @ 3.19 KB (src)   => 3.21 KB (gzip)

>  category  Images
static/media/testbild.2535197bb4cf.jpg @ 24.2 KB (src) => 22.91 KB (gzip)

>  category  Others
./index.html           @ 999 B (src) => 526 B (gzip)
./manifest.webmanifest @ 670 B (src) => 246 B (gzip)

⚠  warning   There are 2 assets which exceed the configured size limit of 250 KB. Affected asset(s) marked in yellow.


```