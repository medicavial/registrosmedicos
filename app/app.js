//creamos la aplicacion
app = angular.module('app', ['ngRoute' ,'ngCookies','ui.bootstrap','angularFileUpload','ngAnimate','ui.grid','ui.grid.edit']);

//configuramos las rutas y asignamos html y controlador segun la ruta
app.config(function($routeProvider){

    //Configuramos la ruta que queremos el html que le toca y que controlador usara
	$routeProvider.when('/agenda',{
             templateUrl: 'vistas/agenda.html',
     });

    $routeProvider.when('/agenda/:autorizacion/:clave_tipo/:lesionado',{
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
    $routeProvider.when('/confirma/:autorizacion/:paciente',{
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

    $routeProvider.when('/observacion/:autorizacion',{
            templateUrl: 'vistas/observacion.html',
            controller : 'observacionCtrl'
    });

    $routeProvider.when('/pruebas',{
            templateUrl: 'vistas/pruebas.html',
            controller : 'pruebasCtrl'
    });

    $routeProvider.when('/seguimiento/:autorizacion',{
            templateUrl: 'vistas/seguimiento.html',
            controller : 'seguimientoCtrl'
    });

	$routeProvider.otherwise({redirectTo:'/login'});

    //$locationProvider.html5Mode(true);

});

//notificaciones que se ejecutan cuando la aplicacion inicia
app.run(function ($rootScope , auth ,$cookies, $cookieStore, $location){

    $rootScope.$on('$routeChangeStart', function(){
        //llamamos a checkStatus, el cual lo hemos definido en la factoria auth
        //la cuál hemos inyectado en la acción run de la aplicación


        $rootScope.username =  $cookies.username;
        $rootScope.permiso = $cookies.permiso;
        $rootScope.user = $cookies.user;
        $rootScope.clave = $cookies.clave;
        $rootScope.hospitalario = $cookies.hospitalario;

        auth.checkStatus();
    });

    $rootScope.logout = function(){

        auth.logout();
    }
    ///Esto es para ver notificaciones existentes aun es manual 

    ///mostramos los tooltip para mostrar los titulos abajo de cada elemento
    $('#tooltip1').tooltip({placement : 'bottom'});
    $('#tooltip2').tooltip({placement : 'bottom'});


    //generamos al rootscope las variables que tenemos en las cookies para no perder la sesion 
    $rootScope.username =  $cookies.username;
    $rootScope.permiso = $cookies.permiso;
    $rootScope.user = $cookies.user;
    $rootScope.clave = $cookies.clave;
    $rootScope.hospitalario = $cookies.hospitalario;

});


//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas

app.factory("auth", function($cookies,$cookieStore,$location, $rootScope, $http)
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
                    $cookies.username = data[0].Uni_nombre;
                    $cookies.permiso = data[0].Per_clave;
                    $cookies.user = data[0].Usu_login;
                    $cookies.clave = data[0].USU_claveMV;
                    $cookies.hospitalario = data[0].Hospitalario;

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
            $cookieStore.remove("username"),
            $cookieStore.remove("permiso");
            $cookieStore.remove("user");
            $cookieStore.remove("clave");
            $rootScope.username =  '';
            $rootScope.permiso = '';
            $rootScope.user = '';
            $rootScope.clave = '';

            //mandamos al login
            $location.path("/login");

        },
        checkStatus : function()
        {
            //creamos un array con las rutas que queremos controlar
            if($location.path() != "/login" && typeof($cookies.username) == "undefined")
            {   
                $location.path("/login");
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if($location.path() == "/login" && typeof($cookies.username) != "undefined")
            {
                $location.path("/home");
            }
        }
    }
});


app.factory("busqueda", function($http){
    return{
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
        detalleobservacion:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleobservacion&autorizacion='+autorizacion);
        },
        movimientos:function(clave){
            return $http.get('api/api.php?funcion=detalleAutorizacionMovimiento&numero='+clave);
        },
        observacion:function(){
            return $http.get('api/api.php?funcion=consultaObservacion');
        },
        posicion:function(){
            return $http.get('api/api.php?funcion=posicion');
        },
        result:function(){
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
           var capitalized = inputValue.toUpperCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
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
 