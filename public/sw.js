// fetch resourceonly from network
self.addEventListener('fetch', function onServiceWorkerFetch(event){
    console.log('Fetch event: ', event.request.url);
    event.respondWith(
        fetch(event.request).then(function returnNetworkResponse(networkResponse){
            console.log(`Fetch from network for ${event.request.url} is successfull.`);
            return networkResponse
        }).catch(function return(err){
            console.log(`Fetch from network for ${event.request.url} is unsuccessfull: `, err);
        })
    );
});