var hoy = new Date(); 
var dd = hoy.getDate(); 
var mm = hoy.getMonth()+1;//enero es 0! 
if (mm < 10) { mm = '0' + mm; }
if (dd < 10) { dd = '0' + dd; }

var yyyy = hoy.getFullYear();
//armamos fecha para los datepicker
var FechaAct = yyyy + '-' + mm + '-' + dd;

var hora = hoy.getHours();
var minuto = hoy.getMinutes();

var FechaActHora = hora + ':' + minuto;

app.controller('detalleAgendaCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){

		$scope.titulo = 'Agendar';
		$scope.detalleAut();
		//$scope.mensaje ='';
		$scope.edicion = true;
		//$scope.autorizacion=$routeParams.autorizacion;
		$scope.datos= {

            
            autorizacion : $routeParams.autorizacion,
            paciente : '',
	    	proveedor :'',
	    	costo : '',
	    	tipo: $routeParams.clave_tipo,
	    	notas : '',
	    	descripcion : '',
	    	referencia : '',
	    	fechacita : FechaAct,
	    	horacita : FechaActHora,	    	
	    	proveedor1 :'',
	    	status: 'Por confirmar',
	    	folio: '',
	    	fecha: FechaAct,
	    	hora:FechaActHora,
	    	movimiento: $routeParams.movimiento
	    	
    	}


	}	

	$scope.detalleAut = function(){

		busqueda.detalleagenda($routeParams.autorizacion).success(function (data){

			$scope.datos = {
				autorizacion:$routeParams.autorizacion,
				tipo:$routeParams.clave_tipo,
				paciente:data[0].AUM_lesionado,
				folio:data[0].AUM_folioMV,
				descripcion:data[0].MOA_texto,
				usuario:$rootScope.clave,
				telefono:data[0].Exp_telefono,
				movimiento:data[0].MOA_claveint
			}

			$scope.autorizacion = data[0].AUM_clave;

		});

	}

     $scope.agenda = function(){
     	 console.log($scope.datos);


    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=agenda',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.autorizacion = data.autorizacion;
		        $location.path("/cita");
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}

 $scope.confirmar = function(){

        console.log($scope.datos);

 //       $scope.datos.status = 'Por confirmar';
 //       $scope.agenda();

     try{

		 	$scope.mensaje ='';

		 	$http({

		         url:'api/api.php?funcion=confirmar',
		         method:'POST', 
		         contentType: "application/json; charset=utf-8", 
		         dataType: "json", 
		         data:$scope.datos
		       

		     }).success(function (data){

		          console.log(data);
		         $scope.mensaje = data.respuesta;
		         $scope.alerta = 'alert-success';
		         $scope.autorizacion = data.autorizacion;
		         $location.path("/cita");
		        
		         //console.log(data);
		     }).error( function (xhr,status,data){

		         $scope.mensaje ='Error';
		         $scope.alerta = 'alert-danger';

		     });

		 }catch(err){

		 	alert(err);
		 }
}


});