var {
  Cc, Ci
} = require('chrome');
var {
  ToggleButton
} = require('sdk/ui/button/toggle');
var events = require('sdk/system/events');
var iOService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
var version = require('./package.json').version;
var addonTitle = require('./package.json').title;

exports.main = function(options, callbacks) {

  const enabledState = {
    icon: {
      '16': './icon-on-16.png',
      '32': './icon-on-32.png',
      '64': './icon-on-64.png'
    },
    //badge: 'IPFS',
    badgeColor: '#4A9EA1'
  };

  const disabledState = {
    icon: {
      '16': './icon-off-16.png',
      '32': './icon-off-32.png',
      '64': './icon-off-64.png'
    },
    //badge: 'HTTP',
    badgeColor: '#8C8C8C'
  };

  var button = ToggleButton({
    id: 'ipfs-gateway-status',
    label: 'IPFS Gateway Redirect',
    icon: {
      '16': './icon-on-16.png',
      '32': './icon-on-32.png',
      '64': './icon-on-64.png'
    },
    checked: true,
    onChange: function(state) {
      // we want a global flag
      this.state('window', null);
      this.checked = !this.checked;

      // update GUI to reflect toggled state
      if (state.checked) {
        button.state(button, enabledState);
      } else {
        button.state(button, disabledState);
      }
    }

  });
  // enabled by default
  button.state(button, enabledState);

  function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    if (channel.URI.host == 'gateway.ipfs.io') {
      if (button.checked) {
        var requestURL = channel.URI.spec;
        var localGatewayURL = requestURL.replace(/gateway.ipfs.io/i, '127.0.0.1:8080');
        channel.redirectTo(iOService.newURI(localGatewayURL, null, null));
      }

      // some free metrics
      channel.setRequestHeader('x-ipfs-firefox-addon-version', version, false);
      channel.setRequestHeader('x-ipfs-firefox-addon-state', button.checked, false);
    }
  }
  events.on('http-on-modify-request', listener);
  console.log('Addon ' + addonTitle + ' loaded.');
};


exports.onUnload = function(reason) {
  console.log('Addon ' + addonTitle + ' unloaded: ' + reason);
};


// TODO: when we have more functionality, we should add tests:
// a dummy function, to show how tests work.
// to see how to test this function, look at ../test/test-main.js
function dummy(text, callback) {
  callback(text);
}
exports.dummy = dummy;
