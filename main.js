function plainTextEuro(amound){
	var inMillion = Math.round(amound * 0.000001).toString();
	
	if(inMillion.length > 3)
		inMillion = inMillion.substring(0, inMillion.length - 3) + ' ' + inMillion.substring(inMillion.length - 3);
	
	return   inMillion +  " millions €";
}


$(function(){
	$('.vCountryName').text("Belgique");
	
	var money = 10000000000;
	
	var simu = new Simulateur;
	simu.onParamLoaded = function(){
		//print the values in the appropriates blocks
		for(var k in simu.params){
			$('.v' + k.charAt(0).toUpperCase() +  k.slice(1)).text(	quantityToHuman(simu.params[k].at(currentYear), simu.params[k].unit, true));
		}
		$('.vPvEffi').text(	quantityToHuman(simu.params['pvEffi'].at(currentYear), '%', true));
	}
	
	simu.loadParams();
		

	var cGrUse = $("#groundUsage")[0].getContext("2d");
	
	var cPlot = $("#cPlot")[0];
	canvasEnablePloting(cPlot);/// make cPlot ready for ploting (call cPlot.setPlot(myPlot))
	
	$('.vMoney').text(plainTextEuro(money));
	

	
	
	
	/// load ground usage
	var groundUseMap = new Image();
	groundUseMap.crossOrigin = '';
	groundUseMap.onload = function () {
		tabGroundUsage();
		
		var imgData = cGrUse.getImageData(0, 0, 1374, 1183);
		var pix = new Uint32Array(imgData.data.buffer);
		
		
		for(var i = 0; i < pix.data.length; i++){
			
		}
	};
	groundUseMap.src = 'landUse.png';
	



	/// switch to ground usage tab 
	function tabGroundUsage(){
		cGrUse.drawImage(groundUseMap, 0, 0);
		
		enableAreaMoving();
		
		$('#dMovable').css('display', 'block');
		$('#dPlotDisplay').css('display', 'none');
	}
	
	/// switch to the pop plot tab
	function tabPlot(e){
		disableAreaMoving();
		$('#dMovable').css('display', 'none');
		$('#dPlotDisplay').css('display', 'block');
		
		var targetLabel = e.currentTarget.getAttribute("data-target");
		var dataToPlot, title, src = '', suffix = undefined;
		
		dataToPlot = simu.params[targetLabel];
		
		if(dataToPlot.source)
			src = dataToPlot.source;
		
		$('#dPlotDisplay h2').text(dataToPlot.label);
		$('#dPlotDisplay .pSource').text('Source : ' + src);
		var plot = new Plot(dataToPlot, 400, 300)
		if(suffix == '%')
			plot.setPercentMode(true);
		cPlot.setPlot(plot);
		
		if(dataToPlot.comment)
			$('#dPlotDisplay .pComment').text(dataToPlot.comment);
		else
			$('#dPlotDisplay .pComment').text('');
	}



	
	var currentYear = 2019;
	
	$('.vYear').text(currentYear);


	$('.bShowPlot').on('click', tabPlot);
	$(document).on('keydown', function(e){
		if(e.keyCode == 27)
			tabGroundUsage();
	});

	/// building -------------------------------------------------------------
	var nowBuilding = undefined;
	
	$('.bBuild').on('click', function(e){
		var t = e.currentTarget.getAttribute("data-target");
		
		nowBuilding  = t;
		
		$('.buildDetail').css('display', 'none');
		$('#' + t + 'BuildDetails').css('display', 'block');
	});
	
	$('#groundUsage').on('mousemove', function(evt){
		if(!nowBuilding)
			return;
		
		cGrUse.drawImage(groundUseMap, 0, 0);
		
		var curPos = {x: evt.offsetX,
					 y: evt.offsetY};
		
		
		if(nowBuilding == 'pv'){
			cGrUse.beginPath();
			cGrUse.arc(curPos.x, curPos.y, $('#pvBuildRange').val(), 0, 2 * Math.PI);
			cGrUse.stroke();
			
			var radius = $('#pvBuildRange').val();
			
			var imgData = cGrUse.getImageData(curPos.x - radius, curPos.y - radius, 2*radius, 2*radius);
			var pix = new Uint32Array(imgData.data.buffer);
			
			
			var area = pix[0];
			var i =0;
			//~ for(var x = -radius; x < radius; x++)
				//~ for(var y = -radius; y < radius; y++){
					//~ if(x*x + y*y < radius * radius &&pix.data[i + 0] == GroundUse.grass){
						//~ area++;
						//~ pix.data[i+0] = 64;
						//~ pix.data[i+1] = 64;
						//~ pix.data[i+2] = 182;
					//~ }
					
					//~ i+=4;
				//~ }
			
			
			cGrUse.putImageData(imgData, curPos.x - radius, curPos.y - radius);
			
			$('#vBuildPvCost').text(area);
			
			
		}
		//~ cGrUse.fillStyle = 'red';
		//~ cGrUse.fillRect(curPos.x, curPos.y, 10, 10);
	});
	
});
