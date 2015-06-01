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

app.factory("auth", function($location, $rootScope, $http, webStorage,$route){
    return{
        login : function(username, password)
        {   
            $('#boton').button('loading');

            $http({
                url:'api/api.php?funcion=login',
                method:'POST', 
                contentType: 'application/json', 
                dataType: "json", 
                data:{user:username,psw:password}
            }).success( function (data){
                
                $('#boton').button('reset');

                console.log(data);

                if(data.respuesta){

                    $rootScope.mensaje = data.respuesta;

                }else{
                    
                    //creamos la cookie con el nombre que nos han pasado
                    webStorage.local.clear();

                    webStorage.session.add('username', data[0].Uni_nombre);
                    webStorage.session.add('permiso', data[0].Per_clave);
                    webStorage.session.add('user', data[0].Usu_login);
                    webStorage.session.add('clave', data[0].USU_claveMV);
                    webStorage.session.add('hospitalario', data[0].Hospitalario);

                    $rootScope.username =  data[0].Uni_nombre;
                    $rootScope.permiso = data[0].Per_clave;
                    $rootScope.user = data[0].Usu_login;
                    $rootScope.clave = data[0].USU_claveMV;
                    $rootScope.hospitalario = data[0].Hospitalario;

                    $location.path("/");

                }
                
            }).error( function (xhr,status,data){

                $('#boton').button('reset');
                alert('Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina');

            });

            
        },
        logout : function()
        {
            //al hacer logout eliminamos la cookie con $cookieStore.remove y los rootscope
            webStorage.session.clear();
            webStorage.local.clear();
            
            $rootScope.username =  '';
            $rootScope.permiso = '';
            $rootScope.user = '';
            $rootScope.clave = '';
            $rootScope.hospitalario = '';
            
            $location.path("/login");
            $route.reload();

        },
        checkStatus : function()
        {
            //creamos un array con las rutas que queremos controlar
            if($location.path() != "/login" && webStorage.session.get('username') == null)
            {   
                $location.path("/login");
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if($location.path() == "/login" && webStorage.session.get('username') != null)
            {
                $location.path("/home");
            }
        }
    }
});


//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas