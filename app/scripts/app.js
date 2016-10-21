'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
Parse.initialize("myAppId", "myAppId", "myMasterKey");
Parse.serverURL = 'http://172.24.1.1:1337/parse';

var app = angular
  .module('sbAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'smart-table',
    'angularModalService',
    'bootstrap.fileField',
    'btford.socket-io',
    'datePicker',
    'jkuri.timepicker',
    'ez.timepicker',
    'ui.rCalendar',
    'ngLodash',
    'ngPDFViewer'
  ]);


  app.config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('dashboard', {
        url:'/dashboard',
        templateUrl: 'views/dashboard/main.html',
        resolve: {
            loadMyDirectives:function($ocLazyLoad){
                return $ocLazyLoad.load(
                {
                    name:'sbAdminApp',
                    files:[
                    'scripts/directives/header/header.js',
                    'scripts/directives/header/header-notification/header-notification.js',
                    'scripts/directives/sidebar/sidebar.js',
                    'scripts/directives/sidebar/sidebar-search/sidebar-search.js',
                    'scripts/services/employeeService.js',
                    'scripts/services/dailyLogService.js',
                    'scripts/services/socketService.js',
                    'scripts/services/settingsService.js'
                    ]
                }),
                $ocLazyLoad.load(
                {
                   name:'toggle-switch',
                   files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                          "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                      ]
                }),
                $ocLazyLoad.load(
                {
                  name:'ngAnimate',
                  files:['bower_components/angular-animate/angular-animate.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngCookies',
                  files:['bower_components/angular-cookies/angular-cookies.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngResource',
                  files:['bower_components/angular-resource/angular-resource.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngSanitize',
                  files:['bower_components/angular-sanitize/angular-sanitize.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngTouch',
                  files:['bower_components/angular-touch/angular-touch.js']
                })
            }
        }
    })
      .state('dashboard.home',{
        url:'/home',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/home.html',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'scripts/controllers/main.js',
              'scripts/directives/timeline/timeline.js',
              'scripts/directives/notifications/notifications.js',
              'scripts/directives/chat/chat.js',
              'scripts/directives/dashboard/stats/stats.js',
              'scripts/services/settingsService.js',
              ]
            })
          }
        }
      })
      .state('dashboard.form',{
        templateUrl:'views/settings.html',
        url:'/settings',
        controller: 'SettingsCtrl',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'scripts/controllers/settings.js',
              'scripts/services/employeeService.js',
              'scripts/services/dailyLogService.js',
              'scripts/services/socketService.js',
              'scripts/services/settingsService.js',
              ]
            })
          }
        }
    })
      .state('dashboard.blank',{
        templateUrl:'views/pages/blank.html',
        url:'/blank'
    })
      .state('login',{
        templateUrl:'views/pages/login.html',
        controller: 'LoginCtrl',
        url:'/login',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
                'scripts/controllers/login.js',
                'scripts/services/settingsService.js',
              ]
            })
          }
        }
    })

    .state('config',{
      templateUrl:'views/pages/config.html',
      controller: 'ConfigCtrl',
      url:'/config',
      resolve: {
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'sbAdminApp',
            files:[
              'scripts/controllers/config.js',
              'scripts/services/employeeService.js',
              'scripts/services/dailyLogService.js',
              'scripts/services/socketService.js',
              'scripts/services/settingsService.js',
            ]
          })
        }
      }
    })

    .state('public',{
      templateUrl:'views/pages/public.html',
      controller: 'PublicCtrl',
      url:'/public',
      resolve: {
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'sbAdminApp',
            files:[
              'scripts/controllers/public.js',
              'scripts/services/employeeService.js',
              'scripts/services/dailyLogService.js',
              'scripts/services/socketService.js',
              'scripts/services/settingsService.js',
            ]
          })
        }
      }
    })
      .state('dashboard.chart',{
        templateUrl:'views/chart.html',
        url:'/chart',
        controller:'ChartCtrl',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                'bower_components/angular-chart.js/dist/angular-chart.css'
              ]
            }),
            $ocLazyLoad.load({
                name:'sbAdminApp',
                files:[
                'scripts/controllers/chartContoller.js',
                'scripts/services/settingsService.js'
                ]
            })
          }
        }
    })
    .state('guide',{
      templateUrl:'views/guide.html',
      url:'/guide',
      controller:'GuideCtrl',
      resolve: {
        loadMyFile:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'guide.js',
            files:[
            'bower_components/angular-chart.js/dist/angular-chart.min.js',
            'bower_components/angular-chart.js/dist/angular-chart.css',
            'js/ng-pdfviewer.js',
            'js/pdf.compat.js',
            'js/pdf.js'
            ]
          }),
          $ocLazyLoad.load({
            name:'sbAdminApp',
            files:[
            'scripts/controllers/guide.js',
            'scripts/services/settingsService.js'
            ]
          })
        }
      }
    })
      .state('dashboard.table',{
        templateUrl:'views/table.html',
        url:'/report',
        controller:'ReportCtrl',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'scripts/controllers/report.js',
              'scripts/services/employeeService.js',
              'scripts/services/dailyLogService.js',
              'scripts/services/periodLogService.js',
              'scripts/services/settingsService.js',
              'scripts/services/socketService.js',
              'scripts/services/holidayService.js'
              ]
            })
          }
        }
    })
    .state('dashboard.logs',{
      templateUrl:'views/logs.html',
      url:'/logs',
      controller:'LogsCtrl',
      resolve: {
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'sbAdminApp',
            files:[
              'scripts/controllers/logs.js',
              'scripts/services/employeeService.js',
              'scripts/services/dailyLogService.js',
              'scripts/services/periodLogService.js',
              'scripts/services/settingsService.js',
              'scripts/services/socketService.js',
              'scripts/services/holidayService.js'
            ]
          })
        }
      }
    })
    .state('dashboard.calendar',{
      templateUrl:'views/calendar.html',
      url:'/calendar',
      controller:'CalendarCtrl',
      resolve: {
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'sbAdminApp',
            files:[
            'scripts/controllers/calendar.js',
            'scripts/services/employeeService.js',
            'scripts/services/dailyLogService.js',
            'scripts/services/periodLogService.js',
            'scripts/services/settingsService.js',
            'scripts/services/socketService.js',
            'scripts/services/holidayService.js'
            ]
          })
        }
      }
    })
      .state('dashboard.panels-wells',{
          templateUrl:'views/ui-elements/panels-wells.html',
          url:'/panels-wells'
      })
      .state('dashboard.buttons',{
        templateUrl:'views/ui-elements/buttons.html',
        url:'/buttons'
    })
      .state('dashboard.notifications',{
        templateUrl:'views/ui-elements/notifications.html',
        url:'/notifications'
    })
      .state('dashboard.typography',{
       templateUrl:'views/ui-elements/typography.html',
       url:'/typography'
   })
      .state('dashboard.icons',{
       templateUrl:'views/ui-elements/icons.html',
       url:'/icons'
   })
      .state('dashboard.grid',{
       templateUrl:'views/ui-elements/grid.html',
       url:'/grid'
   })
  }]);
