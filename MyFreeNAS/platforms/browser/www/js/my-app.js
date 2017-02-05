var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;

Template7.global = {
    android: isAndroid,
    ios: isIos
};

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Change Through navbar layout to Fixed
if (isAndroid) {
    // Change class
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // And move Navbar into Page
    $$('.view .navbar').prependTo('.view .page');
}

// Init App
var myApp = new Framework7({
    // Enable Material theme for Android device only
    material: isAndroid ? true : false,
    // Enable Template7 pages
    template7Pages: true
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var storedData;
var online = false;

function getStoredData()
{
  storedData = myApp.formGetData('settingsForm');
  online = false;
  if(storedData) {
    //myApp.alert(JSON.stringify(storedData));
    $$('#currentServer').html("http://" + storedData["host"] + ":" + storedData["port"]);
  }
  else {
    myApp.alert('Please go to Settings and configure your FreeNAS server!', 'Configuration');
    $$('#currentServer').html("?");
  }
}

function isOnline()
{
  getStoredData();
  
  $$.ajaxSetup({
    headers: {
      'Authorization': 'Basic ' + btoa(storedData["user"] + ":" + storedData["pass"])
    }
  });
  
  online = false;
  setTimeout(setOffline, 2000);
  
  $$.ajax({
    url: "http://" + storedData["host"] + ":" + storedData["port"] + "/api/v1.0/system/version/", 
    success: function (data) {
      console.log(data);
      $$('#currentStatus').html('<span class="circle green"></span>');
      $$('#currentVersion').html(JSON.parse(data)["fullversion"]);
      online = true;
      setTimeout(isOnline, 2000);
    },
    error: function (error) {
      console.log(error);
      $$('#currentStatus').html('<span class="circle red"></span>');
      setTimeout(isOnline, 2000);
  }});
}

function setOffline()
{
  if (!online)
  {
    console.log("offline");
    $$('#currentStatus').html('<span class="circle red"></span>');
    setTimeout(isOnline, 2000);
  }
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
  console.log("Device is ready!");
  setTimeout(isOnline, 1000);
});

// Now we need to run the code that will be executed only for About page.

myApp.onPageInit('index', function (page) {
  console.log("index");
  //getStoredData();
}).trigger();

$$(document).on('pageAfterBack', function (e) {
  console.log("swiping back");
  getStoredData();
});

myApp.onPageInit('settings', function (page) {
  //myApp.alert('blubb');
})

$$('#btnShutdown').on('click', function () {
  getStoredData();
  
  $$.ajaxSetup({
    headers: { 'Authorization': 'Basic ' + btoa(storedData["user"] + ":" + storedData["pass"]) }
  });
  
  $$.post(
    "http://" + storedData["host"] + ":" + storedData["port"] + "/api/v1.0/system/shutdown/", 
    '',
    function (data) {
      console.log(data);
      myApp.alert('System is shutting down!', 'Shutdown');
    },
    function (error) {
      console.log(error);
      myApp.alert('Error: ' + error, 'Shutdown');
    });
});

$$('#btnReboot').on('click', function () {
  getStoredData();
  
  $$.ajaxSetup({
    headers: { 'Authorization': 'Basic ' + btoa(storedData["user"] + ":" + storedData["pass"]) }
  });
  
  $$.post(
    "http://" + storedData["host"] + ":" + storedData["port"] + "/api/v1.0/system/reboot/",
    '',
    function (data) {
      console.log(data);
      myApp.alert('System is rebooting!', 'Reboot');
    },
    function (error) {
      console.log(error);
      myApp.alert('Error: ' + error, 'Reboot');
    });
});
