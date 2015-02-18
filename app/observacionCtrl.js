app.controller('observacionCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){


        
		$scope.titulo = 'Agendar';
		$scope.detalleAut();
		$scope.mensaje ='';
		$scope.correo1= '';
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
	    	observacionres : '',
	    	preexistencia:'',
	    	observacion:'',
	    	archivo: ''


    	}

	}	


	$scope.detalleAut = function(){


		busqueda.detalleobservacion($routeParams.autorizacion).success(function (data){

			console.log(data);

			$scope.datos = {

				autorizacion:data.clave,
				proveedor:data.proveedor,
				costo:data.costo,
				cita:data.tipo,
				notas:data.observacion,
				referencia:data.inforeferencia,
				fechacita:data.fecha,
				horacita:data.hora,
				paciente:data.paciente,
				proveedor:data.conproveedor,
				observacionres:data.resobservacion,
				observacion:data.observacioncoor,
				preexistencia:data.preexistencia

			}

			$scope.autorizacion = data.clave;
			$scope.archivo = data.archivo;

		});

	}

	// $scope.detalleAut = function(){


	// 	busqueda.detalleobservacion($routeParams.autorizacion).success(function (data){

	// 		console.log(data);

	// 		$scope.datos = {

	// 			autorizacion:data[0].AUM_clave,
	// 			proveedor:data[0].RC_proveedor,
	// 			costo:data[0].RC_costo,
	// 			cita:data[0].RC_tipocita,
	// 			notas:data[0].RC_obs,
	// 			referencia:data[0].RC_inforeferencia,
	// 			fechacita:data[0].RC_fechahora,
	// 			horacita:data[0].RC_hora,
	// 			paciente:data[0].RC_paciente,
	// 			proveedor:data[0].RC_conproveedor,
	// 			observacionres:data[0].RC_resobservacion,
	// 			observacion:data[0].RC_observacioncoor,
	// 			preexistencia:data[0].RC_preexistencia

	// 		}

	// 		$scope.autorizacion = data[0].AUM_clave;

	// 	});

	// }

	 $scope.actualiza = function(){

        
   //     $scope.coor.clave=$routeParams.autorizacion;
        console.log($scope.correo);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=actualizacoordinacion',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.coor = data.coordinacion;
		        $scope.correo1 = data.correo;

		        $scope.edicion = false;
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}

$scope.envia = function(){

	$scope.correo.clave=$routeParams.autorizacion;
	console.log($scope.correo);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=enviacorreo',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.correo
		       

		    }).success(function (data){

		        console.log(data);
		        $scope.mensaje1 = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.correo = data.correo;
		        if(confirm("Tu Correo fue enviado")) {

		        $location.path("/cita");

		    }
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje1 ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}


 
});