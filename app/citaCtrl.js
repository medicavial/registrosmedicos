
var hoy = new Date(); 
var dd = hoy.getDate(); 
var mm = hoy.getMonth()+1;//enero es 0! 
if (mm < 10) { mm = '0' + mm; }
if (dd < 10) { dd = '0' + dd; }

var yyyy = hoy.getFullYear();
//armamos fecha para los datepicker
var FechaAct = yyyy + '-' + mm + '-' + dd;

app.controller('citaCtrl', function($scope, $http, busqueda, $location, todoFactory, $timeout, $upload) {

	$scope.inicio = function(){

		$scope.contador = '';
		$scope.buscaautorizaciones();
		$scope.buscaconfirmaciones();
		$scope.buscaresultados();
		$scope.buscaobservaciones();
		$scope.buscaconcluidos();
		$scope.pendienteTransferir();
		$scope.buscapendientes();
		$scope.todos = [];
		$scope.transacciones = [];
		$scope.ptransfers = [];
        $scope.variable = 1;
        $scope.ts = [];
        $scope.bit = false;
        $scope.mensajependiente = '';
        $scope.mensaje_transaccion = '';
        

		$scope.autorizacion = {
			folio:'',
			autorizacion:''

		}

		$scope.admin = {

			autorizacion:''

		}

		$scope.confirmar = {

			folio:'',
			autorizacion:''

		}

		$scope.resultado = {

			folio:'',
			autorizacion:''

		}

		$scope.observaciones = {

			folio:'',
			autorizacion:''

		}

		$scope.concluidos = {

			folio:'',
			autorizacion:''

		}

		$scope.datos = {

			relacion: '',
			codigorelacion: ''
	    
	    }

	}

		$scope.transaccion = {

			relacion: '',
			codigotransaccion: '',
			fechaalta: FechaAct,
			caja: ''
	    
	    }

	$scope.buscaautorizaciones = function(){

		busqueda.autoriza().success(function (data){
			console.log(data);
			//$scope.autoriza = data;
			$scope.contador = data.contador;
			$scope.autoriza = data.autoriza;

		});

	}

	$scope.buscaconfirmaciones = function(){

		busqueda.confirma().success(function (data){
            
		    $scope.contadorcita = data.contadorcita;
			$scope.confirma = data.confirma;
		});

	}

	$scope.buscaobservaciones = function(){

		busqueda.observacion().success(function (data){
            
		    $scope.contadorob = data.contadorob;
			$scope.observacion = data.observacion;
		});

	}

	$scope.buscaresultados = function(){

		busqueda.resultado().success(function (data){
            
		    $scope.contadorres = data.contadorres;
			$scope.resultado = data.resultado;
		});

	}

	$scope.buscaconcluidos = function(){

		busqueda.concluido().success(function (data){
            
		    $scope.contadorconcluido = data.contadorconcluido;
			$scope.concluido = data.concluido;
		});

	}

	$scope.buscapendientes = function(){

		busqueda.pendiente().success(function (data){
            
		    // $scope.contadorconcluido = data.contadorconcluido;
		  $scope.todos = data.pendiente;
		  var resta = 0;
		  $scope.resultado = 0;


// selected fruits
		  $scope.selection = [];

		//  toggle selection for a given fruit by name
		  $scope.toggleSelection = function toggleSelection(todo) {

		    var idx = $scope.selection.indexOf(todo);

		    // is currently selected
		    if (idx > -1) {

		        $scope.selection.splice(idx, 1);

		        var suma = 0
		        $scope.resultado = 0;
		        $scope.subtotal = 0;

		        console.log(suma);

		        if ($scope.selection == ' ') {

		        	suma = 0;
		        	$scope.resultado = suma;
		        	$scope.subtotal = suma;
		        };

		        console.log($scope.selection);

		        
		        for (var i = 0; i < $scope.selection.length; i++) {


		            suma+= parseInt($scope.selection[i].total);
		            $scope.resultado = suma;
		            $scope.subtotal = suma;

		        }


		    } else {

		        $scope.selection.push(todo);

		        console.log($scope.selection);

		        var suma = 0

		        
		        for (var i = 0; i < $scope.selection.length; i++) {


		            suma+= parseInt($scope.selection[i].total);
		            $scope.resultado = suma;
		             $scope.subtotal = suma;

		        }

		    }
		    return suma;
		  };


		});

	//	$scope.$watch($scope.selection.total  function (newVal,oldVal));

	}

	$scope.pendienteTransferir = function(){

		busqueda.pendienteTranferir().success(function (data){
            
		    // $scope.contadorconcluido = data.contadorconcluido;
		  $scope.ptransfers = data.pendiente;
		  $scope.resultado_transferir = 0;

		  $scope.selectiones = [];

		  // toggle selection for a given fruit by name
		  $scope.toggleSelectiones = function toggleSelectiones(ptransfe) {
		    var idx = $scope.selectiones.indexOf(ptransfe);

		    // is currently selected
		    if (idx > -1) {
		      $scope.selectiones.splice(idx, 1);   


		        var sumas = 0
		        $scope.resultado_transferir = 0;
		        $scope.subtotal_transferir = 0;

		        console.log(sumas);

		        if ($scope.selectiones == ' ') {

		        	sumas = 0;
		        	$scope.resultado_transferir = sumas;
		        	$scope.subtotal_transferir = sumas;
		        };

		        console.log($scope.selectiones);

		        
		        for (var i = 0; i < $scope.selectiones.length; i++) {


		            sumas+= parseInt($scope.selectiones[i].total);
		            $scope.resultado_transferir = sumas;
		            $scope.subtotal_transferir = sumas;

		        }


		    }
		    // is newly selected
		    else {

		      $scope.selectiones.push(ptransfe);

		      var sumas = 0

		        
		        for (var i = 0; i < $scope.selectiones.length; i++) {

		            sumas+= parseInt($scope.selectiones[i].total);
		            $scope.resultado_transferir = sumas;
		            $scope.subtotal_transferir = sumas;

		        }

		    }

		  };

		});

	}

	$scope.agregarelacion = function(){

		$scope.datos = {

			relacion: '',
			codigorelacion: ''
	    
	    }

		$scope.mensaje = '';
		$scope.bit = false;
		$scope.ts = '';

	    if ($scope.selection == '') {

			alert('No Seleccionaste Nada');
			$scope.bit = false;
			return $scope.selection;
		}

		$scope.ts = $scope.selection;

	}

    $scope.agregatransaccion = function(){

		$scope.transaccion = {

			relacion: '',
			codigotransaccion: '',
			fecha: '',
			caja: ''
	    
	    }

		$scope.mensaje_transaccion = '';
		// $scope.bit = false;
		$scope.transacciones = '';

	    if ($scope.selectiones == '') {

			alert('No Seleccionaste Nada');
			$scope.bit = false;
			return $scope.selectiones;
		}

		$scope.transacciones = $scope.selectiones;
		console.log($scope.selectiones);

	}

	$scope.buscarAutorizacion = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarAutorizacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.autorizacion
		}).success( function (data){

			console.log(data);

			$scope.autoriza = data;


		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarConfirmados = function(){

		console.log($scope.confirmar);
		$http({
			url:'api/api.php?funcion=buscarConfirmados',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.confirmar
		}).success( function (data){
			console.log(data);
			$scope.confirma = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarResultados = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarResultados',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.resultados
		}).success( function (data){
			console.log(data);
			$scope.resultado = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarObservacion = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarObservacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.observaciones
		}).success( function (data){
			console.log(data);
			$scope.observacion = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarConcluidos = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarConcluidos',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.concluidos
		}).success( function (data){
			console.log(data);
			$scope.concluido = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarConcluidos2 = function(){

		console.log($scope.admin);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarConcluidos2',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.admin
		}).success( function (data){
			console.log(data);
			$scope.concluidos = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.cambiastatus = function(){

		console.log($scope.admin);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=cambiastatus',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.admin
		}).success( function (data){
			console.log(data);

        $scope.mensaje = data.respuesta;
        $scope.alerta = 'alert-success';
        location.reload()


		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.guardarelacion = function(){


		$scope.datos.relacion = $scope.selection;  
		$scope.datos.codigorelacion;
		$scope.datos.totalrelacion = $scope.subtotal;

		console.log($scope.datos);

		$http({
			url:'api/api.php?funcion=guardarelacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.datos
		}).success( function (data){

			$scope.mensaje = 'Se enviaron tus datos';
			$scope.alerta = 'alert-success';
			$scope.bit = true;
			location.reload();


		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.guardatransaccion = function(){


		$scope.transaccion.relacion = $scope.selectiones;  
		$scope.transaccion.codigotransaccion;
		$scope.transaccion.totaltransaccion = $scope.resultado_transferir ;

		console.log($scope.selectiones);

		$http({
			url:'api/api.php?funcion=guardatransferencia',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.transaccion
		}).success( function (data){

			$scope.mensaje_transaccion = 'Se enviaron tus datos';
			$scope.alerta = 'alert-success';
			$scope.bit = data.bit;
			location.reload();

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

// $scope.operators = 
 //    {   
 //        "value": "suma", 
 //        "values": ["suma", "resta", "mutliplicacion", "division"] 
 //    };
 
 //    $scope.calcular = function(){
 
 //        switch($scope.operators.value)
 //        {
 
 //            case "suma":
 //                  $scope.resultado = parseInt($scope.first) + parseInt($scope.second);
 //              break;
 //            case "resta":
 //                  $scope.resultado = parseInt($scope.first) - parseInt($scope.second);
 //              break;
 //            case "mutliplicacion":
 //                  $scope.resultado = parseInt($scope.first) * parseInt($scope.second);
 //              break;
 //            case "division":
 //                  $scope.resultado = parseInt($scope.first) / parseInt($scope.second);
 //              break;
          
 //        }
        
 //    }
 
 //    $scope.$watch($scope.calcular);
       
});