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


function entero(e, field) {
  
  key = e.keyCode ? e.keyCode : e.which
  // backspace
  if (key == 8) return true
  // 0-9
  if (key > 47 && key < 58) {
    if (field.value == "") return true
    regexp = /.[0-9]{5}$/
    return !(regexp.test(field.value))
  }
  // other key
  
  return false

}

function autorizacionesCtrl($scope,$http, busqueda, $rootScope, $filter){
	
	$scope.inicio = function(){
		$scope.titulo = 'Autorizaciones Médicas';
		//$scope.autoriza = 0;
			
		$scope.altaunidad();
		$scope.altacliente();
		$scope.autorizacionUsuarios();
		$scope.tipoMov();
		$scope.movimientos = [];
		$scope.mensaje = '';
		$scope.autorizacion = '';

		

		$scope.datos = {
			cliente:0,
			unidad:0,
			fecha:FechaAct,
			nombrelesionado:'',
			edad:0,
			medico:'',
			diagnostico:'',
			folio:'',
			tipoautorizacion: '',
			usuario:$rootScope.clave
		}

		if ($rootScope.clave == 0) {
			alert('No tienes permiso disponible para dar de alta hospitalarios solicitalo al area de sistemas');
			$scope.edicion = true;
		}else{
			$scope.edicion = false;
		}

		$('#movimiento').on('hide.bs.modal', function (e) {
		  	$scope.muestramovimientos();
		});

		$('#tooltip1').tooltip({placement : 'right'});

	}

	$scope.autorizacionUsuarios = function (){

		busqueda.usuariosComerciales().success(function (data){
			$scope.usuariosComer = data;
		});
	}	

	$scope.tipoMov = function(){

		busqueda.tipoMovimiento().success(function (data){
			$scope.tipos = data;
		});
	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	// presiona Folio
	$scope.presionaFolio = function(evento){

		//contamos la cadena completa
		var cantidad = $scope.datos.folio.length;

		//los primero cuatro caracteres NO deben ser numeros
		if(cantidad < 3){
			if (evento.keyCode >= 48 && evento.keyCode <= 57 || evento.keyCode >= 96 && evento.keyCode <= 105) {
		      	evento.preventDefault();
		    }
		}

		//los ultimos 6 NO deben ser letras
		if(cantidad > 3 && cantidad < 9){
			if (evento.keyCode >= 65 && evento.keyCode <= 90) {
		      	evento.preventDefault();
		    }
		}

		//Si son mas de 10 digitos no escribas mas
		if(cantidad > 9){
			if (evento.keyCode != 8  && evento.keyCode != 46 ) {

		      	evento.preventDefault();
		    }      	
		}

		//Si se da enter o salto de linea ejecuta la funcion verifica folio pasandole que es de tipo fax
		if (evento.keyCode == 13 || evento.keyCode == 9) {

	      	$scope.verificaFolio();

	    }

	}

	$scope.verificaFolio = function(){

		if ($scope.datos.folio != '') {

			var totalletras = $scope.datos.folio.length

			var letras = $scope.datos.folio.substr(0,4);
			var numeros = $scope.datos.folio.substr(4,totalletras);

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

			$scope.datos.folio = letras + numeros;

			$scope.buscafolio();
		}	

	}

	$scope.buscafolio = function(){

		$scope.edicion = false;

		angular.element('#folio').addClass('loadinggif');

		busqueda.folio($scope.datos.folio).success(function (data){

			console.log(data);

			if (data.autorizaciones.length == 0) {


				if(!data.folio.length == 0){

					$scope.datos.cliente = data.folio[0].CIA_clave;
					$scope.datos.unidad = data.folio[0].UNI_clave;
					$scope.datos.nombrelesionado = data.folio[0].EXP_completo;
					$scope.datos.edad = data.folio[0].EXP_edad;

				}else{

					alert('El folio solicitado no existe');
					$scope.datos.folio = '';

				}
				
				
			}else{

				alert('El Folio ya tiene numero de autorización ' + data.autorizaciones[0].AUM_clave);

				$scope.edicion = true;
			}

			angular.element('#folio').removeClass('loadinggif');
			
		});
	}

	$scope.nuevomovimiento = function(){

		$scope.autoriza = 0;
		$scope.aut = false;

		$scope.movimiento = {
			tipo:'',
			fecha:FechaAct,
			descripcion:'',
			usuario:$rootScope.clave,
			autorizacioncomercial:'',
			clave:$scope.autorizacion
		}

		$scope.mensaje2 = '';
	}

	$scope.guardar = function(){

		try{

			if (!$scope.aut) {
				$scope.datos.autorizacioncomercial = '';
			};

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=guardaAutorizacion',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos

		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.tipoalerta = 'alert-success';
		        $scope.autorizacion = data.clave;
		        $scope.edicion = true;
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
	}

	$scope.muestramovimientos = function(){

		busqueda.movimientos($scope.autorizacion).success(function (data){
			$scope.movimientos = data;
			console.log($scope.movimientos);
		});

	}

	$scope.verificaMovimiento = function(){
		
		if ( $scope.movimiento.tipo != 2  && $scope.datos.folio == '') {
			$scope.movimiento.tipo = '';
			alert('No puedes ingresar otro tipo de movimiento que no sea problema documental cuando no se tiene un folio');
		};
	}


	$scope.guardaMovimiento = function(){

		try{

			
			$scope.mensaje2 ='';

			$http({

		        url:'api/api.php?funcion=guardaMovimiento',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.movimiento

		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje2 = data.respuesta;
		        $scope.tipoalerta = 'alert-success';

		        $scope.movimiento.tipo = '';
				$scope.movimiento.fecha = FechaAct;
				$scope.movimiento.descripcion = '';
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
		
	}	

}

function detalleAutorizacionesCtrl($scope, $http, busqueda, $rootScope, $routeParams, $filter){
	
	$scope.inicio = function(){

		$scope.titulo = 'Autorizaciones Médicas';
		$scope.altaunidad();
		$scope.altacliente();
		$scope.tipoMov();
		$scope.detalleAut();
		$scope.autorizacionUsuarios();
		$scope.edicion = true;
		//$scope.autoriza = 0;

		$('#movimiento').on('hide.bs.modal', function (e) {
		  	$scope.muestramovimientos();
		});

		$('#tooltip1').tooltip({placement : 'right'});

	}	

	$scope.tipoMov = function(){

		busqueda.tipoMovimiento().success(function (data){
			$scope.tipos = data;
		});
	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.detalleAut = function(){


		busqueda.detalleautorizacion($routeParams.clave).success(function (data){

			$scope.datos = {
				cliente:data[0].EMP_claveint,
				unidad:data[0].UNI_claveint,
				fecha:$filter('date')(Date.parse(data[0].AUM_fecha),'yyyy-MM-dd'),
				nombrelesionado:data[0].AUM_lesionado,
				edad:data[0].AUM_edad,
				medico:data[0].AUM_medico,
				diagnostico:data[0].AUM_diagnostico,
				folio:data[0].AUM_folioMV,
				usuario:$rootScope.clave,
				autorizacioncomercial:data[0].UCO_claveint
			}

			$scope.autorizacion = data[0].AUM_clave;

			if ($scope.datos.autorizacioncomercial) {
				$scope.aut = true;
				$scope.autoriza = 1;
			}else{
				$scope.aut = false;
				$scope.autoriza = 0;
			}

			$scope.muestramovimientos();

		});

	}

	$scope.autorizacionUsuarios = function (){

		busqueda.usuariosComerciales().success(function (data){
			$scope.usuariosComer = data;
		});
	}	

	// presiona Folio
	$scope.presionaFolio = function(evento){

		//contamos la cadena completa
		var cantidad = $scope.datos.folio.length;

		//los primero cuatro caracteres NO deben ser numeros
		if(cantidad < 3){
			if (evento.keyCode >= 48 && evento.keyCode <= 57 || evento.keyCode >= 96 && evento.keyCode <= 105) {
		      	evento.preventDefault();
		    }
		}

		//los ultimos 6 NO deben ser letras
		if(cantidad > 3 && cantidad < 9){
			if (evento.keyCode >= 65 && evento.keyCode <= 90) {
		      	evento.preventDefault();
		    }
		}

		//Si son mas de 10 digitos no escribas mas
		if(cantidad > 9){
			if (evento.keyCode != 8  && evento.keyCode != 46 ) {

		      	evento.preventDefault();
		    }      	
		}

		//Si se da enter o salto de linea ejecuta la funcion verifica folio pasandole que es de tipo fax
		if (evento.keyCode == 13 || evento.keyCode == 9) {

	      	$scope.verificaFolio();

	    }

	}

	$scope.nuevomovimiento = function(){

		$scope.autoriza = 0;
		$scope.aut = false;

		$scope.movimiento = {
			tipo:'',
			fecha:FechaAct,
			descripcion:'',
			usuario:$rootScope.clave,
			autorizacioncomercial:'',
			clave:$scope.autorizacion
		}

		$scope.mensaje2 = '';
	}

	$scope.verificaMovimiento = function(){

		if ( $scope.movimiento.tipo != 2 && $scope.datos.folio == '') {
			$scope.movimiento.tipo = '';
			alert('No puedes ingresar otro tipo de movimiento que no sea problema documental cuando no se tiene un folio');
		};
	}

	$scope.verificaFolio = function(){

		if ($scope.datos.folio != '') {

			var totalletras = $scope.datos.folio.length

			var letras = $scope.datos.folio.substr(0,4);
			var numeros = $scope.datos.folio.substr(4,totalletras);

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

			$scope.datos.folio = letras + numeros;

			// $scope.datos.foliosxfolio();
		}	

	}

	$scope.guardar = function(){

		try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=guardaAutorizacion',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos

		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje2 = data.respuesta;
		        $scope.tipoalerta = 'alert-success';
		        $scope.autorizacion = data.clave;
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
	}

	$scope.muestramovimientos = function(){

		busqueda.movimientos($scope.autorizacion).success(function (data){
			$scope.movimientos = data;
			console.log($scope.movimientos);
		});

	}


	$scope.guardaMovimiento = function(){

		try{

			if (true) {};
			
			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=guardaMovimiento',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.movimiento

		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje2 = data.respuesta;
		        $scope.tipoalerta = 'alert-success';

		        $scope.movimiento.tipo = '';
				$scope.movimiento.fecha = FechaAct;
				$scope.movimiento.descripcion = '';
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
		
	}	

}

function detalleHospitalariosCtrl($scope,$http, busqueda,$rootScope, $routeParams, $filter){
	
	$scope.inicio = function(){
		$scope.titulo = 'Hospitalarios';
		$scope.altaunidad();
		$scope.altacliente();
		$scope.altariesgo();
		$scope.altaposicion();
		$scope.detalleHos();
		$scope.mensaje ='';
		$scope.edicion = true;
		
	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altariesgo = function(){

		busqueda.riesgo().success(function (data){
			$scope.riesgos = data;
		});

	}

	$scope.altaposicion = function(){

		busqueda.posicion().success(function (data){
			$scope.posiciones = data;
		});

	}

	$scope.detalleHos = function(){

		busqueda.detallehospitalario($routeParams.clave).success(function (data){

			console.log(data);
			$scope.datos = {
				ajustador:data[0].HOS_ajustador,
				ambulancia:data[0].HOS_ambulancia,
				asegurado:data[0].HOS_asegurado,
				autoriza:data[0].HOS_quienAutoriza,
				claveajustador:data[0].HOS_ajustadorClave,
				cliente:data[0].EMP_claveint,
				domicilio:data[0].HOS_domicilio,
				edad:data[0].HOS_edad,
				fechaatencion:$filter('date')(Date.parse(data[0].HOS_fechaAtencion),'yyyy-MM-dd'),
				fechahospitalario:$filter('date')(Date.parse(data[0].HOS_fechaHospitalario),'yyyy-MM-dd'),
				folio:data[0].EXP_folio,
				horareporte:$filter('date')(Date.parse(data[0].HOS_horaIniRep),'shortTime'),
				horarfineporte:$filter('date')(Date.parse(data[0].HOS_horaFinRep),'shortTime'),
				inciso:data[0].HOS_inciso,
				motivo:data[0].HOS_motivoHos,
				nombrelesionado:data[0].HOS_lesionado,
				observaciones:data[0].HOS_observaciones,
				otros:data[0].HOS_otros,
				poliza:data[0].HOS_poliza,
				posicion:data[0].POS_clave,
				reporta:data[0].HOS_quienReporta,
				reporte:data[0].HOS_reporte,
				riesgo:data[0].RIE_claveInt,
				siniestro:data[0].HOS_siniestro,
				traslado:data[0].HOS_trasladoA,
				unidad:data[0].UNI_claveint,
				usuario:$rootScope.clave
			}

			$scope.hospitalario = data[0].HOS_clave;

			// var hora = $filter('date')(Date.parse(data[0].HOS_fechaAtencion),'shortDate');

			// console.log(hora);

			// $scope.datos.horareporte = hora;


		});
		
	}

	// presiona Folio
	$scope.presionaFolio = function(evento){

		//contamos la cadena completa
		var cantidad = $scope.datos.folio.length;

		//los primero cuatro caracteres NO deben ser numeros
		if(cantidad < 3){
			if (evento.keyCode >= 48 && evento.keyCode <= 57 || evento.keyCode >= 96 && evento.keyCode <= 105) {
		      	evento.preventDefault();
		    }
		}

		//los ultimos 6 NO deben ser letras
		if(cantidad > 3 && cantidad < 9){
			if (evento.keyCode >= 65 && evento.keyCode <= 90) {
		      	evento.preventDefault();
		    }
		}

		//Si son mas de 10 digitos no escribas mas
		if(cantidad > 9){
			if (evento.keyCode != 8  && evento.keyCode != 46 ) {

		      	evento.preventDefault();
		    }      	
		}

		//Si se da enter o salto de linea ejecuta la funcion verifica folio pasandole que es de tipo fax
		if (evento.keyCode == 13 || evento.keyCode == 9) {

	      	$scope.verificaFolio();

	    }

	}

	$scope.verificaFolio = function(){

		if ($scope.datos.folio != '') {

			var totalletras = $scope.datos.folio.length

			var letras = $scope.datos.folio.substr(0,4);
			var numeros = $scope.datos.folio.substr(4,totalletras);

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

			$scope.datos.folio = letras + numeros;

			// $scope.foliosxfolio();
		}	

	}


	$scope.guardar = function(){

		try{

			if ($scope.datos.siniestro == '' && $scope.datos.reporte == '') {
				throw 'Debes ingresar siniestro o reporte';
			};
			console.log($scope.datos);
			$scope.mensaje ='';

			$http({
		        url:'api/api.php?funcion=guardaHospitalario',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.tipoalerta = 'alert-success';
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}

	}

}

function hospitalariosCtrl($scope,$http, busqueda,$rootScope, $filter){
	
	$scope.inicio = function(){
		$scope.titulo = 'Hospitalarios';

		$scope.hospitalario = '';
		$scope.altaunidad();
		$scope.altacliente();
		$scope.altariesgo();
		$scope.altaposicion();
		$scope.mensaje ='';
		$scope.datos = {
			ajustador:'',
			ambulancia:'',
			asegurado:'',
			autoriza:'',
			claveajustador:'',
			cliente:'',
			domicilio:'',
			edad:0,
			fechaatencion:FechaAct,
			fechahospitalario:FechaAct,
			folio:'',
			horareporte:$filter('date')(new Date(),'shortTime'),
			horarfineporte:$filter('date')(new Date(),'shortTime'),
			inciso:'',
			motivo:'',
			nombrelesionado:'',
			observaciones:'',
			otros:'',
			poliza:'',
			posicion:'',
			reporta:'',
			reporte:'',
			riesgo:'',
			siniestro:'',
			traslado:'',
			unidad:'',
			usuario:$rootScope.clave
		}

		if ($rootScope.clave == 0) {
			alert('No tienes permiso disponible para dar de alta hospitalarios solicitalo al area de sistemas');
			$scope.edicion = true;
		}else{
			$scope.edicion = false;
		}


	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altariesgo = function(){

		busqueda.riesgo().success(function (data){
			$scope.riesgos = data;
		});

	}

	$scope.altaposicion = function(){

		busqueda.posicion().success(function (data){
			$scope.posiciones = data;
		});

	}

	// presiona Folio
	$scope.presionaFolio = function(evento){

		//contamos la cadena completa
		var cantidad = $scope.datos.folio.length;

		//los primero cuatro caracteres NO deben ser numeros
		if(cantidad < 3){
			if (evento.keyCode >= 48 && evento.keyCode <= 57 || evento.keyCode >= 96 && evento.keyCode <= 105) {
		      	evento.preventDefault();
		    }
		}

		//los ultimos 6 NO deben ser letras
		if(cantidad > 3 && cantidad < 9){
			if (evento.keyCode >= 65 && evento.keyCode <= 90) {
		      	evento.preventDefault();
		    }
		}

		//Si son mas de 10 digitos no escribas mas
		if(cantidad > 9){
			if (evento.keyCode != 8  && evento.keyCode != 46 && evento.keyCode != 13 ) {

		      	evento.preventDefault();
		    }      	
		}

		//Si se da enter o salto de linea ejecuta la funcion verifica folio pasandole que es de tipo fax
		if (evento.keyCode == 13 || evento.keyCode == 9) {

	      	$scope.verificaFolio();

	    }

	}

	$scope.verificaFolio = function(){

		if ($scope.datos.folio != '') {

			var totalletras = $scope.datos.folio.length

			var letras = $scope.datos.folio.substr(0,4);
			var numeros = $scope.datos.folio.substr(4,totalletras);

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

			$scope.datos.folio = letras + numeros; 

			$scope.buscafolio();
		}	

	}


	$scope.buscafolio = function(){

		$scope.edicion = false;
		angular.element('#folio').addClass('loadinggif');

		busqueda.folio($scope.datos.folio).success(function (data){

			console.log(data);

			if (data.hospitalario.length == 0) {

				if (!data.folio.length == 0){

					$scope.datos.cliente = data.folio[0].CIA_clave;
					$scope.datos.unidad = data.folio[0].UNI_clave;
					$scope.datos.nombrelesionado = data.folio[0].EXP_completo;
					$scope.datos.edad = data.folio[0].EXP_edad;
					$scope.datos.fechaatencion = data.folio[0].EXP_fecreg;
					$scope.datos.siniestro = data.folio[0].EXP_siniestro;
					$scope.datos.poliza = data.folio[0].EXP_poliza;
					$scope.datos.reporte = data.folio[0].EXP_reporte;

				}else{
					
					alert('El folio solicitado no existe');
					$scope.datos.folio = '';
					
				}

				
			}else{
				alert('El Folio ya tiene numero de hospitalario ' + data.hospitalario[0].HOS_clave);
				$scope.edicion = true;
			}

			angular.element('#folio').removeClass('loadinggif');

		});


	}


	$scope.guardar = function(){

		try{

			if ($scope.datos.siniestro == '' && $scope.datos.reporte == '') {
				throw 'Debes ingresar siniestro o reporte';
			};
			console.log($scope.datos);
			$scope.mensaje ='';

			$http({
		        url:'api/api.php?funcion=guardaHospitalario',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		    }).success(function (data){

		        // console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.tipoalerta = 'alert-success';
		        $scope.hospitalario = data.clave;

		        $scope.edicion = true;
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
		        $scope.tipoalerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}

	}

}


function impresionCtrl($scope, $http, busqueda, $rootScope, $routeParams, $filter){
	
	$scope.inicio = function(){

		$scope.altaunidad();
		$scope.altacliente();
		$scope.tipoMov();
		$scope.detalleAut();
		$scope.edicion = true;
		$scope.autorizacion = true;

	}	

	$scope.tipoMov = function(){

		busqueda.tipoMovimiento().success(function (data){
			$scope.tipos = data;
		});
	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.detalleAut = function(){


		busqueda.detalleautorizacion($routeParams.clave).success(function (data){

			$scope.cliente = data[0].Cia_nombrecorto;
			$scope.unidad = data[0].UNI_nombreMV;
			$scope.fecha = $filter('date')(Date.parse(data[0].AUM_fecha),'yyyy-MM-dd');
			$scope.lesionado = data[0].AUM_lesionado;
			$scope.edad = data[0].AUM_edad;
			$scope.medico = data[0].AUM_medico;
			$scope.diagnostico = data[0].AUM_diagnostico;
			$scope.folio = data[0].AUM_folioMV;
			$scope.usuario = $rootScope.clave;

			$scope.autorizacion = data[0].AUM_clave;

			$scope.muestramovimientos();

		});

	}


	$scope.muestramovimientos = function(){

		busqueda.movimientos($scope.autorizacion).success(function (data){
			$scope.movimientos = data;
		});

	}

}

function loginCtrl($scope, auth, $rootScope){

	$scope.inicio = function(){

		$scope.usuario = '';
		$scope.contrasena = '';
		$rootScope.mensaje = '';
	}

	$scope.login = function(){

		auth.login($scope.usuario,$scope.contrasena);
	}

}

function busquedasCtrl($scope, busqueda, $http, $rootScope){

	$scope.inicio = function(){
		$scope.buscaautorizaciones();
		$scope.altaunidad();
		$scope.altacliente();

		$scope.autorizacion = {
			folio:'',
			autorizacion:'',
			fechaini:'',
			fechafin:'',
			lesionado:'',
			cliente:'',
			unidad:''
		}

		$scope.hospitalario = {
			folio:'',
			hospitalario:'',
			fechaini:'',
			fechafin:'',
			lesionado:'',
			cliente:'',
			unidad:''
		}

		$scope.datos = {

			rfc: '',
			emisor: '',
			fechaEmi: '',
			foliofiscal: '',
			archivosdet: ''
		}
	}

	$scope.buscaautorizaciones = function(){

		busqueda.autorizaciones().success(function (data){
			$scope.autorizaciones = data;
		});

	}

	$scope.buscahospitalarios = function(){
		
		busqueda.hospitalarios().success(function (data){
			$scope.hospitalarios = data;
		});

	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.buscarAut = function(){

		if (!$scope.fechaaut) {
			$scope.autorizacion.fechaini = '';
			$scope.autorizacion.fechafin = '';
		};

		console.log($scope.autorizacion);
		$http({
			url:'api/api.php?funcion=busquedaAutorizacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.autorizacion
		}).success( function (data){
			
			$scope.autorizaciones = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarHos = function(){

		if (!$scope.fechahos) {
			$scope.hospitalario.fechaini = '';
			$scope.hospitalario.fechafin = '';
		};
		
		console.log($scope.hospitalario);
		$http({
			url:'api/api.php?funcion=busquedaHospitalarios',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.hospitalario
		}).success( function (data){
			console.log(data);
			$scope.hospitalarios = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});

	}

	$scope.verificaFolioA = function(folio){

		$scope.autorizacion.folio = busqueda.rellenaFolio(folio);
	}

	$scope.verificaFolioH = function(folio){

		$scope.hospitalario.folio = busqueda.rellenaFolio(folio);
	}

	$scope.Buscar = function(){

		$scope.archivosdetalles = [];


        try{

            $http({

                url:'api/api.php?funcion=buscarFactura',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.datos

            }).success(function (data){

            	console.log(data);

                $scope.datos.detalle = true;
            	$scope.datos.rfc = data.rfc;
            	$scope.datos.foliofiscal = data.foliofiscal;
            	$scope.datos.fechaemision = data.fechaemision;
            	$scope.datos.autorizacion = data.autorizacion;
            	$scope.datos.movimiento = data.movimiento;
            	$scope.datos.receptor = data.receptor;
            	$scope.datos.subtotal = data.importe;
            	$scope.datos.emisor = data.emisor;
            	$scope.datos.iva = data.iva;
            	$scope.datos.total = data.total;
            	$scope.datos.descuento = data.descuento;
            	$scope.archivosdetalles = data.archivo;
            	$scope.datos.estatus = data.estatus;

                                
                //console.log(data);
            }).error( function (xhr,status,data){

                alertService.add('danger', 'ERROR!!!');


            });

        }catch(err){

            alert(err);
        }
        
    }

    $scope.elimina_factura = function(){

    	console.log($scope.datos);
    	console.log($scope.archivosdetalles);
    	$scope.datos.usuario = $rootScope.user;


        try{

            $http({

                url:'api/api.php?funcion=eliminaFactura',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.datos

            }).success(function (data){

            	alert('Tu factura fue Eliminada');


                                
                //console.log(data);
            }).error( function (xhr,status,data){

                alertService.add('danger', 'ERROR!!!');


            });

        }catch(err){

            alert(err);
        }
        
    }
	
}


function buscaAtencionesCtrl($scope, busqueda, DTOptionsBuilder){

	$scope.inicio = function(){
		$scope.limpia();
		$scope.altaunidad();
	}

	$scope.limpia = function(){
		$scope.datos = {
			folio:'',
			lesionado:'',
			reporte:'',
			siniestro:'',
			poliza:'',
			fechaini:'',
			fechafin:'',
			unidad:''
		}
	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.buscar = function(){
		$('#boton').button('loading');
		busqueda.expedientes($scope.datos).success(function (data){
			$scope.listado = data;
			$('#boton').button('reset');
			$scope.limpia();
		});
	};

	$scope.dtOptions = DTOptionsBuilder.newOptions()
	.withOption('lengthMenu', [ [10, 25, 50, 100, -1], [10, 25, 50, 100, "Todo"] ])
    // .withOption('responsive', true)
    .withPaginationType('full_numbers')
    .withOption('language', {
        paginate: {
            first: "«",
            last: "»",
            next: "→",
            previous: "←"
        },
        search: "Buscar:",
        loadingRecords: "Cargando Información....",
        lengthMenu: "    Mostrar _MENU_ entradas",
        processing: "Procesando Información",
        infoEmpty: "No se encontro información",
        emptyTable: "Sin Información disponible",
        info: "Mostrando pagina _PAGE_ de _PAGES_ , Registros encontrados _TOTAL_ ",
        infoFiltered: " - encontrados _MAX_ coincidencias"
    });

    // .withOption('rowCallback', function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    //     $('td', nRow).bind('click', function() {
    //         $scope.$apply(function() {
    //             $scope.muestraDetalle(aData);
    //         });
    //     });
    //     return nRow;
    // });


    // Add Bootstrap compatibility
    // .withBootstrap()
    // Add ColVis compatibility
    // .withColVis()
    // Add a state change function
    // .withOption("colVis",{
    //     buttonText: "Mostrar / Ocultar Columnas"
    // })
    // Exclude the last column from the list
    // .withColVisOption('aiExclude', [2])

    // Add ColReorder compatibility
    // .withColReorder()
    // Set order
    // .withColReorderOrder([1, 0, 2])
    // Fix last right column
    // .withColReorderOption('iFixedColumnsRight', 1)
    //Add Table tools compatibility
    // .withTableTools('js/swf/copy_csv_xls_pdf.swf')
    // .withTableToolsButtons([

    //     {
    //         "sExtends":     "copy",
    //          "sButtonText": "Copiar"
    //     },
    //     {
    //         'sExtends': 'collection',
    //         'sButtonText': 'Exportar',
    //         'aButtons': ['xls', 'pdf']
    //     }
    // ]);
	
}


app.controller('autorizacionesCtrl',autorizacionesCtrl);
app.controller('detalleAutorizacionesCtrl',detalleAutorizacionesCtrl);
app.controller('detalleHospitalariosCtrl',detalleHospitalariosCtrl);
app.controller('hospitalariosCtrl',hospitalariosCtrl);
app.controller('impresionCtrl',impresionCtrl);
app.controller('loginCtrl',loginCtrl);
app.controller('busquedasCtrl',busquedasCtrl);
app.controller('buscaAtencionesCtrl',buscaAtencionesCtrl);