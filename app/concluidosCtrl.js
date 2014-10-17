app.controller('concluidosCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

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
	    	fechacita : '',
	    	horacita : '',
	    	paciente : '',
	    	proveedor :'',
	    	observacion: '',
	    	observacioncor: '',
	    	preexistencia: ''
    	}


	}	


	$scope.detalleAut = function(){


		busqueda.detalleconcluido($routeParams.autorizacion).success(function (data){

			console.log(data);

			$scope.datos = {

				autorizacion:data[0].AUM_clave,
				proveedor:data[0].RC_proveedor,
				costo:data[0].RC_costo,
				cita:data[0].RC_tipocita,
				notas:data[0].RC_obs,
				referencia:data[0].RC_inforeferencia,
				fechacita:data[0].RC_fechahora,
				horacita:data[0].RC_hora,
				paciente:data[0].RC_paciente,
				proveedor:data[0].RC_conproveedor,
				observacion:data[0].RC_resobservacion,
				observacioncor:data[0].RC_observacioncoor,
				preexistencia:data[0].RC_preexistencia

			}

			$scope.autorizacion = data[0].AUM_clave;

		});

	}

});