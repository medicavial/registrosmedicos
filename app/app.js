//creamos la aplicacion
app = angular.module('app', [
    'ngRoute' ,
    'ngCookies',
    'ui.bootstrap',
    'angularFileUpload',
    'ngAnimate',
    'ui.grid',
    'ui.grid.edit',
    'webStorageModule',
    'datatables'
]);

//configuramos las rutas y asignamos html y controlador segun la ruta
app.config(function($routeProvider){

    //Configuramos la ruta que queremos el html que le toca y que controlador usara
	$routeProvider.when('/agenda',{
             templateUrl: 'vistas/agenda.html',
     });

    $routeProvider.when('/agenda/:autorizacion/:clave_tipo/:movimiento',{
            templateUrl: 'vistas/agenda.html',
            controller : 'detalleAgendaCtrl'
    });

    $routeProvider.when('/autorizaciones',{
            templateUrl: 'vistas/autorizaciones.html',
            controller : 'autorizacionesCtrl'
    });

    $routeProvider.when('/autorizacion/:clave',{
            templateUrl: 'vistas/autorizaciones.html',
            controller : 'detalleAutorizacionesCtrl'
    });

    $routeProvider.when('/concluidos/:autorizacion',{
            templateUrl: 'vistas/concluidos.html',
            controller : 'concluidosCtrl'
    });

    $routeProvider.when('/confirma/:autorizacion/:paciente/:folio',{
            templateUrl: 'vistas/confirma.html',
            controller : 'detalleConfirmarCtrl'
    });

    $routeProvider.when('/impresion/:tipo/:clave',{
            templateUrl: 'vistas/impresion.html',
            controller : 'impresionCtrl'
    });

    $routeProvider.when('/busquedas',{
            templateUrl: 'vistas/busquedas.html',
            controller : 'busquedasCtrl'
    });

    $routeProvider.when('/buscaatenciones',{
            templateUrl: 'vistas/buscaatenciones.html',
            controller : 'buscaAtencionesCtrl'
    });

    $routeProvider.when('/busquedaCitas',{
            templateUrl: 'vistas/busquedaCitas.html',
            controller : 'busquedaCitasCtrl'
    });

    $routeProvider.when('/cita',{
            templateUrl: 'vistas/cita.html',
            controller : 'citaCtrl'
    });

    $routeProvider.when('/factura/:autorizacion/:movimiento',{
            templateUrl: 'vistas/factura.html',
            controller : 'facturaCtrl'
    });

    $routeProvider.when('/home',{
  			templateUrl: 'vistas/home.html'
  	});

    $routeProvider.when('/hospitalarios',{
            templateUrl: 'vistas/hospitalarios.html',
            controller : 'hospitalariosCtrl'
    });

    $routeProvider.when('/hospitalario/:clave',{
            templateUrl: 'vistas/hospitalarios.html',
            controller : 'detalleHospitalariosCtrl'
    });

    $routeProvider.when('/login',{
            templateUrl: 'vistas/login.html',
            controller : 'loginCtrl'
    });

    $routeProvider.when('/monitor',{
            templateUrl: 'vistas/monitor.html'
    });

    $routeProvider.when('/observacion/:autorizacion/:tipo/:movimiento',{
            templateUrl: 'vistas/observacion.html',
            controller : 'observacionCtrl'
    });

    $routeProvider.when('/pendienteValidar/:autorizacion/:movimiento',{
            templateUrl: 'vistas/pendienteValidar.html',
            controller : 'pendienteValidarCtrl'
    });

    $routeProvider.when('/pruebas',{
            templateUrl: 'vistas/pruebas.html',
            controller : 'pruebasCtrl'
    });

    $routeProvider.when('/seguimiento/:autorizacion/:tipo/:movimiento',{
            templateUrl: 'vistas/seguimiento.html',
            controller : 'seguimientoCtrl'
    });

    $routeProvider.when('/seguimientoCitas',{
            templateUrl: 'vistas/seguimientoCitas.html',
            controller : 'seguimientoCitasCtrl'
    });

	$routeProvider.otherwise({redirectTo:'/login'});

    //$locationProvider.html5Mode(true);

});

//notificaciones que se ejecutan cuando la aplicacion inicia
app.run(function ($rootScope , auth , $location, webStorage){

    //generamos al rootscope las variables que tenemos en las cookies para no perder la sesion 

    $rootScope.username = webStorage.session.get('username');
    $rootScope.permiso = webStorage.session.get('permiso');
    $rootScope.user = webStorage.session.get('user');
    $rootScope.clave = webStorage.session.get('clave');
    $rootScope.hospitalario = webStorage.session.get('hospitalario');

    $rootScope.$on('$routeChangeStart', function(){
        //llamamos a checkStatus, el cual lo hemos definido en la factoria auth
        //la cuál hemos inyectado en la acción run de la aplicación
        
        auth.checkStatus();

    });

    $rootScope.logout = function(){

        auth.logout();
    }
    ///Esto es para ver notificaciones existentes aun es manual 

    ///mostramos los tooltip para mostrar los titulos abajo de cada elemento
    $('#tooltip1').tooltip({placement : 'bottom'});
    $('#tooltip2').tooltip({placement : 'bottom'});

});


//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas