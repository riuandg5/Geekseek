// current cache name
var currentCache = 'Geekseek_NSIT';
// Chrome's currently missing some useful cache methods, this polyfill adds them.
polyfillCache();
// Here comes the install event! This only happens once, when the browser sees this version of the ServiceWorker for the first time.
self.addEventListener('install', function onServiceWorkerInstall(event){
    console.log('Install event: ', event)
    // We pass a promise to event.waitUntil to signal how long install takes, and if it failed
    event.waitUntil(
        caches.open(currentCache).then(function addResourceToCache(cache){
            return cache.addAll([
                '/',
                '/favicons/svg/ss.jpg',
                '/favicons/svg/ra.jpg',
                '/offline.html'
            ])
        }).catch(function(err){
            console.log("Can't add to cache: ", err);
        })
    );
});

// The fetch event happens for the page request with the ServiceWorker's scope, and any request made within that page
self.addEventListener('fetch', function onServiceWorkerFetch(event){
    console.log('Fetch event: ', event.request.url);
    // Calling event.respondWith means we're in charge of providing the response. We pass in a promise that resolves with a response object
    event.respondWith(
    // First we look if we can get the (maybe updated) resource from the network
        fetch(event.request).then(function updateCacheAndReturnNetworkResponse(networkResponse){
            console.log(`Fetch from network for ${event.request.url} is successfull, updating cache..`);
            caches.open(currentCache).then(function addToCache(cache){
                return cache.add(event.request)
            }).catch(function(err){
                console.log("Can't update the cache: ", err);
            })
            return networkResponse
        }).catch(function lookupCachedResponse(reason){
            // On failure, look up in the Cache for the requested resource
            console.log(`Fetch from network for ${event.request.url} is unsuccessfull: `, reason);
            return caches.match(event.request).then(function returnCachedResponse(cachedResponse){
                if(cachedResponse){
                    return cachedResponse
                } else {
                    // On faliure, look for offline page and return
                    console.log("Can't get from cache also..");
                    return caches.match("offline.html").then(function returnOfflinePage(offlinePage){
                        return offlinePage
                    })
                }
            })
        })
    );
});
// pollyfillCache working
function polyfillCache() {
    if(!Cache.prototype.add){
        Cache.prototype.add = function add(request) {
            return this.addAll([request])
        }
    }
    if(!Cache.prototype.addAll){
        Cache.prototype.addAll = function addAll(requests){
            var cache = this
            // Since DOMExceptions are not constructable:
            function NetworkError(message){
                this.name = 'NetworkError'
                this.code = 19
                this.message = message
            }
            NetworkError.prototype = Object.create(Error.prototype)
            return Promise.resolve().then(function(){
                if(arguments.length < 1) throw new TypeError()
                // Simulate sequence<(Request or USVString)> binding:
                var sequence = []
                requests = requests.map(function(request){
                    if(request instanceof Request){
                        return request
                    } else {
                        return String(request) // may throw TypeError
                    }
                })
                return Promise.all(
                    requests.map(function(request){
                        if(typeof request === 'string'){
                            request = new Request(request)
                        }
                        var scheme = new URL(request.url).protocol
                        if (scheme !== 'http:' && scheme !== 'https:'){
                            throw new NetworkError('Invalid scheme')
                        }
                        return fetch(request.clone())
                    })
                )
            }).then(function(responses){
                // TODO: check that requests don't overwrite one another
                // (don't think this is possible to polyfill due to opaque responses)
                return Promise.all(
                    responses.map(function(response, i){
                        return cache.put(requests[i], response)
                    })
                )
            }).then(function(){
                return undefined
            })
        }
    }
    if(!CacheStorage.prototype.match){
        // This is probably vulnerable to race conditions (removing caches etc)
        CacheStorage.prototype.match = function match(request, opts){
            var caches = this
            return this.keys().then(function(cacheNames){
                var match
                return cacheNames.reduce(function(chain, cacheName){
                    return chain.then(function(){
                        return match || caches.open(cacheName).then(function(cache){
                            return cache.match(request, opts)
                        }).then(function(response){
                            match = response
                            return match
                        })
                    })
                }, Promise.resolve())
            })
        }
    }
}