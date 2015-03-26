//creamos la aplicacion
app = angular.module('app', ['ngRoute' ,'ngCookies','ui.bootstrap','angularFileUpload','ngAnimate','ui.grid','ui.grid.edit','webStorageModule']);

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

app.factory("auth", function($location, $rootScope, $http, webStorage)
{
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

            //mandamos al login
            $location.path("/login");

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

app.factory('todoFactory',function($http){
          var factory = [];
          
          factory.getxmltemporal = function(variable){
            return $http.get('Facturas/'+ variable);
          },

          factory.getTodos = function(autorizacion, movimiento, variable){
            return $http.get('Facturas/'+ autorizacion + '-'+ movimiento + '/' + variable);
          }
         
            return factory;
    });


app.factory('busqueda', function($http){
    return{
        administrador:function(){
            return $http.get('api/api.php?funcion=consultaConcluidos2');
        },
        archivo:function(){
            return $http.get('api/api.php?funcion=mostrararchivo');
        },
        autorizaciones:function(){
            return $http.get('api/api.php?funcion=consultaAutorizaciones');
        },
        autoriza:function(){
            return $http.get('api/api.php?funcion=consultaAut');
        },
        concluido:function(){
            return $http.get('api/api.php?funcion=consultaConcluidos');
        },
        confirma:function(){
            return $http.get('api/api.php?funcion=consultaConfirmaciones');
        },
        empresas:function(){
            return $http.get('api/api.php?funcion=empresas');
        },
        folio:function(folio){
            return $http.get('api/api.php?funcion=consultaFolio&folio='+folio);
        },
        hospitalarios:function(){
            return $http.get('api/api.php?funcion=consultaHospitalarios');
        },
        detalleagenda:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleAgenda&autorizacion='+autorizacion);
        },
        detalleconcluido:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleConcluido&autorizacion='+autorizacion);
        },
        detallealtacita:function(autorizacion){
            return $http.get('api/api.php?funcion=detallealtacita&autorizacion='+autorizacion);
        },
        detalleautorizacion:function(clave){
            return $http.get('api/api.php?funcion=detalleAutorizacion&numero='+clave);
        },
        detallehospitalario:function(clave){
            return $http.get('api/api.php?funcion=detalleHospitalario&numero='+clave);
        },
        detalleobservacion:function(autorizacion, tipo, movimiento){
            return $http.get('api/api.php?funcion=detalleobservacion&autorizacion='+autorizacion+'&tipo='+tipo+'&movimiento='+movimiento);
        },
        detalleresultado:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleres&autorizacion='+autorizacion);
        },
        infolesionado:function(autorizacion){
            return $http.get('api/api.php?funcion=infolesionado&autorizacion='+autorizacion);
        },
        movimientos:function(clave){
            return $http.get('api/api.php?funcion=detalleAutorizacionMovimiento&numero='+clave);
        },
        observacion:function(){
            return $http.get('api/api.php?funcion=consultaObservacion');
        },
        pendiente:function(){
            return $http.get('api/api.php?funcion=consultaPendientes');
        },
        pendienteTranferir:function(){
            return $http.get('api/api.php?funcion=pendienteTransferir');
        },
        posicion:function(){
            return $http.get('api/api.php?funcion=posicion');
        },
        resultado:function(){
            return $http.get('api/api.php?funcion=consultaResultados');
        },
        riesgo:function(){
            return $http.get('api/api.php?funcion=riesgo');
        },
        tipoMovimiento:function(){
            return $http.get('api/api.php?funcion=tipoMovimiento');
        },
        unidades:function(){
            return $http.get('api/api.php?funcion=unidades');
        },
        usuariosComerciales:function(){
            return $http.get('api/api.php?funcion=usuariosComerciales');
        },
        verificaprefijo:function(prefijo,empresa){
            return $http.get('/documento/api/verificaprefijo/'+prefijo +"/"+empresa);
        },
        rellenaFolio:function(folio){

            if (folio != '') {

              var totalletras = folio.length;

              var letras = folio.substr(0,4);
              var numeros = folio.substr(4,totalletras);

              if(letras.length < 4 ){

                var faltantes = 4 - letras.length;

                for (var i = 0; i < faltantes; i++) {

                  var letra = letras.charAt(i);
                  letras = letras + "0";
                }
              }

              if(numeros.length < 6 ){

                var faltantes = 6 - numeros.length;

                for (var i = 0; i < faltantes; i++) {
                  
                  numeros = "0" + numeros;
                }
              }

              folio = letras + numeros;

              return folio;

            }else{

              return folio

            }


        }
    }
});

app.factory('uploadManager', function ($rootScope) {
    var _files = [];
    return {
        add: function (file) {
            _files.push(file);
            $rootScope.$broadcast('fileAdded', file.files[0].name);
        },
        clear: function () {
            _files = [];
        },
        files: function () {
            var fileNames = [];
            $.each(_files, function (index, file) {
                fileNames.push(file.files[0].name);
            });
            return fileNames;
        },
        upload: function () {
            $.each(_files, function (index, file) {
                file.submit();
            });
        },
        setProgress: function (percentage) {
            $rootScope.$broadcast('uploadProgress', percentage);
        }
    };
});


app.factory('alertService', ['$timeout', '$rootScope',
    function($timeout, $rootScope) {
        alertService = {};
        $rootScope.alerts = [];

        alertService.add = function(type, title, msg, timeout) {
            $rootScope.alerts.push({
                type: type,
                title: title,
                msg: msg,
                close: function() {
                    return alertService.closeAlert(this);
                }
            });

            if(typeof timeout == 'undefined') {
                timeout = 3000;
            }

            if (timeout) {
                $timeout(function(){
                    alertService.closeAlert(this);
                }, timeout);
            }
        }

        alertService.closeAlert = function(alert) {
            return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
        }

        alertService.closeAlertIdx = function(index) {
            return $rootScope.alerts.splice(index, 1);
        }

        return alertService;
    }
]);

app.directive('upload', ['uploadManager', function factory(uploadManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).fileupload({
                dataType: 'text',
                add: function (e, data) {
                    uploadManager.add(data);
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    uploadManager.setProgress(progress);
                },
                done: function (e, data) {
                    uploadManager.setProgress(0);
                }
            });
        }
    };
}]);

app.directive('ngKeydown', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
             // this next line will convert the string
             // function name into an actual function
             var functionToCall = scope.$eval(attrs.ngKeydown);
             elem.on('keydown', function(e){
                  // on the keydown event, call my function
                  // and pass it the keycode of the key
                  // that was pressed
                  // ex: if ENTER was pressed, e.which == 13
                  functionToCall(e);
             });
        }
    };
});


app.directive('excel', function(){
    return {
        restrict: 'E',
        scope: true,
        scope: { info: '=' },
        template: '<button ng-click="click(info)" class="btn btn-success btn-lg glyphicon glyphicon-download-alt"> Exportar</button>',
        controller: function($scope, $element){

            $scope.click = function(info){

                var arrData = typeof info != 'object' ? JSON.parse(info) : info;
                var CSV = ''; 
                var ReportTitle ='';   
                //Set Report title in first row or line

                //CSV += ReportTitle + '\r\n\n';

                //This condition will generate the Label/Header
                var row = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {
                    
                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }

                row = row.slice(0, -1);

                //append Label row with line break
                CSV += row + '\r\n';

                //1st loop is to extract each row
                for (var i = 0; i < arrData.length; i++) {
                    var row = "";
                    
                    //2nd loop will extract each column and convert it in string comma-seprated
                    for (var index in arrData[i]) {
                        row += '"' + arrData[i][index] + '",';
                    }

                    row.slice(0, row.length - 1);
                    
                    //add a line break after each row
                    CSV += row + '\r\n';
                }

                if (CSV == '') {        
                    alert("Invalid data");
                    return;
                }   

                //Generate a file name
                var fileName = "Reporte_";
                //this will remove the blank-spaces from the title and replace it with an underscore
                fileName += ReportTitle.replace(/ /g,"_");   

                //Initialize file format you want csv or xls
                var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

                // Now the little tricky part.
                // you can use either>> window.open(uri);
                // but this will not work in some browsers
                // or you will not get the correct file extension    

                //this trick will generate a temp <a /> tag
                var link = document.createElement("a");    
                link.href = uri;

                //set the visibility hidden so it will not effect on your web-layout
                link.style = "visibility:hidden";
                link.download = fileName + ".CSV";

                //this part will append the anchor tag and remove it after automatic click
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            }
        }
    }
});


//funcion para convertir mayusculas
app.directive('folio', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {

          var functionToCall = scope.$eval(attrs.folio);

          var rellenaFolio = function(folio){

            if (folio != '') {

              var totalletras = folio.length;

              var letras = folio.substr(0,4);
              var numeros = folio.substr(4,totalletras);

              if(letras.length < 4 ){

                var faltantes = 4 - letras.length;

                for (var i = 0; i < faltantes; i++) {

                  var letra = letras.charAt(i);
                  letras = letras + "0";
                }
              }

              if(numeros.length < 6 ){

                var faltantes = 6 - numeros.length;

                for (var i = 0; i < faltantes; i++) {
                  
                  numeros = "0" + numeros;
                }
              }

              folio = letras + numeros;

              return folio;

            }else{

              return folio

            }
          }
          
          modelCtrl.$parsers.push(function (inputValue) {
             if (inputValue == undefined) return '' 
             var transformedInput = inputValue.toUpperCase();
             if (transformedInput!=inputValue) {
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
             }         

             return transformedInput;         
          });

          element.on('keydown', function(e){
                
                // console.log(scope);
                // console.log(element);
                // console.log(attrs);
                console.log(modelCtrl);
                

                var cantidad = modelCtrl.$modelValue.length;

                console.log(cantidad);
                console.log(e);

                //los primero cuatro caracteres NO deben ser numeros
                if(cantidad < 4){
                  if (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105) {
                        e.preventDefault();
                    }
                }

                //los ultimos 6 NO deben ser letras
                if(cantidad > 3 && cantidad < 10){
                  if (e.keyCode >= 65 && e.keyCode <= 90) {
                        e.preventDefault();
                  }
                }

                //Si son mas de 10 digitos no escribas mas
                if(cantidad > 9){
                    
                    if (e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105) {
                      e.preventDefault();
                    }else{
                      console.log('Presionaste ' + e.keyCode);
                    } 

                }

                if (e.keyCode == 13 || e.keyCode == 9) {

                      if (cantidad > 4) {

                          functionToCall(modelCtrl.$modelValue);
                            
                      };
                      
                          
                }


          });



      }

    };
    
});


app.directive('numeros', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {

       modelCtrl.$parsers.push(function (inputValue) {
           if (inputValue == undefined) return '' 
           var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         

           return transformedInput;         
       });
     }
   };
});

//funcion para convertir mayusculas
app.directive('mayusculas', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var capitalize = function(inputValue) {
                
                if (inputValue) {
                    
                    var capitalized = inputValue.toUpperCase();
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }         
                    return capitalized;
                };

            }

            modelCtrl.$parsers.push(capitalize);

            if (modelCtrl.$modelValue.length > 0) {
                
                capitalize(scope[attrs.ngModel]);  
            }
        }
   };
   
});


app.directive('money', function () {

  var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

  function link(scope, el, attrs, ngModelCtrl) {
    var min = parseFloat(attrs.min || 0);
    var precision = parseFloat(attrs.precision || 2);
    var lastValidValue;

    function round(num) {
      var d = Math.pow(10, precision);
      return Math.round(num * d) / d;
    }

    function formatPrecision(value) {
      return parseFloat(value).toFixed(precision);
    }

    function formatViewValue(value) {
      return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
    }


    ngModelCtrl.$parsers.push(function (value) {
      // Handle leading decimal point, like ".5"
      if (value.indexOf('.') === 0) {
        value = '0' + value;
      }

      // Allow "-" inputs only when min < 0
      if (value.indexOf('-') === 0) {
        if (min >= 0) {
          value = null;
          ngModelCtrl.$setViewValue('');
          ngModelCtrl.$render();
        } else if (value === '-') {
          value = '';
        }
      }

      var empty = ngModelCtrl.$isEmpty(value);
      if (empty || NUMBER_REGEXP.test(value)) {
        lastValidValue = (value === '')
          ? null
          : (empty ? value : parseFloat(value));
      } else {
        // Render the last valid input in the field
        ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
        ngModelCtrl.$render();
      }

      ngModelCtrl.$setValidity('number', true);
      return lastValidValue;
    });
    ngModelCtrl.$formatters.push(formatViewValue);

    var minValidator = function(value) {
      if (!ngModelCtrl.$isEmpty(value) && value < min) {
        ngModelCtrl.$setValidity('min', false);
        return undefined;
      } else {
        ngModelCtrl.$setValidity('min', true);
        return value;
      }
    };
    ngModelCtrl.$parsers.push(minValidator);
    ngModelCtrl.$formatters.push(minValidator);

    if (attrs.max) {
      var max = parseFloat(attrs.max);
      var maxValidator = function(value) {
        if (!ngModelCtrl.$isEmpty(value) && value > max) {
          ngModelCtrl.$setValidity('max', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('max', true);
          return value;
        }
      };

      ngModelCtrl.$parsers.push(maxValidator);
      ngModelCtrl.$formatters.push(maxValidator);
    }

    // Round off
    if (precision > -1) {
      ngModelCtrl.$parsers.push(function (value) {
        return value ? round(value) : value;
      });
      ngModelCtrl.$formatters.push(function (value) {
        return value ? formatPrecision(value) : value;
      });
    }

    el.bind('blur', function () {
      var value = ngModelCtrl.$modelValue;
      if (value) {
        ngModelCtrl.$viewValue = formatPrecision(value);
        ngModelCtrl.$render();
      }
    });
  }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

});
 