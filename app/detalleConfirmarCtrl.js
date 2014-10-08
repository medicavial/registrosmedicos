app.controller('detalleConfirmarCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){

		$scope.titulo = 'Agendar';
		//console.log($routeParams.autorizacion);
		$scope.detalleAut();
		$scope.mensaje ='';
		$scope.edicion = true;
		//$scope.autorizacion=$routeParams.autorizacion;

		$scope.datos= {

            autorizacion : '',
	    	proveedor :'',
	    	costo : '',
	    	cita:'',
	    	notas : '',
	    	referencia : '',
	    	fechacita :FechaAct,
	    	horacita :FechaActHora,
	    	paciente :'',
	    	proveedor1 :'',
	//    	status: 'Por confirmar'
    	}


	}	


	$scope.detalleAut = function(){


		busqueda.detallealtacita($routeParams.autorizacion).success(function (data){

			console.log(data);

			$scope.datos = {

				autorizacion:data[0].AUM_clave,
				proveedor:data[0].RC_proveedor,
				costo:data[0].RC_costo,
				cita:data[0].RC_tipocita,
				notas:data[0].RC_obs,
				referencia:data[0].RC_inforeferencia

			}

			$scope.autorizacion = data[0].AUM_clave;

		});

	}

	 $scope.actualiza = function(){

        console.log($scope.datos);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=actualizacita',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.autorizacion = data.autorizacion;
		        //$location.path("/seguimiento");
		        
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