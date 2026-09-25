
(function () {
    if (window._flixBypassPatched) return;
    window._flixBypassPatched = true;

    var HOUSEHOLD_MARKERS = [
        'household',
        'in-home',
        'inhome',
        'setlocationcontext',
        'householdstatus',
        'updatememberstate',
        'memberstatus',
        'userhousehold',
        'updatehousehold',
        'verifyhousehold',
        'householderror',
        'householdvalidation',
        'account/household',
        'traveling',
        'incorrecthousehold',
        'is_household',
        'mfa_required'
    ];

    function containsHouseholdData(text) {
        if (!text) return false;
        var lower = text.toLowerCase();
        for (var i = 0; i < HOUSEHOLD_MARKERS.length; i++) {
            if (lower.indexOf(HOUSEHOLD_MARKERS[i]) !== -1) return true;
        }
        return false;
    }

    function isNetflixApiRequest(url) {
        if (!url || typeof url !== 'string') return true;
        var lower = url.toLowerCase();
        return lower.indexOf('graphql') !== -1 ||
               lower.indexOf('shakti') !== -1 ||
               lower.indexOf('netflix.com') !== -1 ||
               lower.indexOf('/api/') !== -1 ||
               lower.indexOf('/nq/') !== -1 ||
               url.charAt(0) === '/';
    }

    // --- Patch fetch: intercept requests and responses ---
    var _origFetch = window.fetch;
    if (_origFetch) {
        window.fetch = function (input, init) {
            var url = '';
            if (typeof input === 'string') url = input;
            else if (input && input.url) url = input.url;
            else if (input && input.href) url = input.href;

            if (isNetflixApiRequest(url)) {
                var reqBody = '';
                if (typeof input === 'object' && input && input.body) {
                    try { reqBody = String(input.body); } catch(e){}
                }
                if (init && init.body) {
                    try {
                        reqBody = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
                    } catch(e) {
                        try { reqBody = String(init.body); } catch(e1){}
                    }
                }

                if (containsHouseholdData(reqBody)) {
                    console.log('[FlixBypass] Blocked household fetch request:', url);
                    return Promise.reject(new TypeError('Blocked by FlixBypass'));
                }

                return _origFetch.apply(this, arguments).then(function (response) {
                    if (!response || !response.ok) return response;
                    var clone = response.clone();
                    return clone.text().then(function (body) {
                        if (containsHouseholdData(body)) {
                            console.log('[FlixBypass] Stripped household data from fetch response:', url);
                            return new Response('{"data":{}}', {
                                status: 200,
                                statusText: 'OK',
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        return response;
                    }).catch(function () {
                        return response;
                    });
                });
            }
            return _origFetch.apply(this, arguments);
        };
    }

    // --- Patch XMLHttpRequest ---
    var _origOpen = XMLHttpRequest.prototype.open;
    var _origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._flixUrl = typeof url === 'string' ? url : '';
        return _origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        var self = this;
        if (isNetflixApiRequest(this._flixUrl)) {
            var reqBody = '';
            if (body) {
                try {
                    reqBody = typeof body === 'string' ? body : JSON.stringify(body);
                } catch(e) {
                    try { reqBody = String(body); } catch(e1){}
                }
            }

            if (containsHouseholdData(reqBody)) {
                console.log('[FlixBypass] Blocked household XHR request:', this._flixUrl);
                return;
            }

            var origResponseText = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText');
            var origResponse = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');

            try {
                Object.defineProperty(self, 'responseText', {
                    get: function () {
                        var raw = origResponseText && origResponseText.get ? origResponseText.get.call(self) : self._rawResponseText;
                        if (containsHouseholdData(raw)) {
                            console.log('[FlixBypass] Stripped household data from XHR responseText');
                            return '{"data":{}}';
                        }
                        return raw;
                    },
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(self, 'response', {
                    get: function () {
                        var raw = origResponse && origResponse.get ? origResponse.get.call(self) : self._rawResponse;
                        if (typeof raw === 'string' && containsHouseholdData(raw)) {
                            console.log('[FlixBypass] Stripped household data from XHR response');
                            return '{"data":{}}';
                        }
                        return raw;
                    },
                    configurable: true,
                    enumerable: true
                });
            } catch(e) {
                var interceptor = function () {
                    try {
                        var respText = self.responseText || '';
                        if (containsHouseholdData(respText)) {
                            console.log('[FlixBypass] Stripped household data from XHR response fallback');
                            Object.defineProperty(self, 'responseText', { value: '{"data":{}}', writable: true, configurable: true });
                            Object.defineProperty(self, 'response', { value: '{"data":{}}', writable: true, configurable: true });
                        }
                    } catch (err) { }
                };
                this.addEventListener('load', interceptor, { once: true, capture: true });
            }
        }
        return _origSend.apply(this, arguments);
    };

    console.log('[FlixBypass] Response interception active for Edge (document.' + document.readyState + ')');
})();

