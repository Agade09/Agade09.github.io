function JacksonPollock3SiteMale(form){
	var sum = parseFloat(form.skinfold_pectoral.value)+parseFloat(form.skinfold_abdomen.value)+parseFloat(form.skinfold_quadriceps.value)
	return 1.10938-0.0008267*sum+0.0000016*Math.pow(sum,2)-0.0002574*form.age.value
}

function JacksonPollock3SiteFemale(form){
	var sum = parseFloat(form.skinfold_triceps.value)+parseFloat(form.skinfold_suprailiac.value)+parseFloat(form.skinfold_quadriceps.value)
	return 1.0994921-0.0009929*sum+0.0000023*Math.pow(sum,2)-0.0001392*form.age.value
}

function JacksonPollock7SiteMale(form){
	var sum = parseFloat(form.skinfold_pectoral.value)+parseFloat(form.skinfold_abdomen.value)+parseFloat(form.skinfold_quadriceps.value)+parseFloat(form.skinfold_triceps.value)+parseFloat(form.skinfold_midaxilla.value)+parseFloat(form.skinfold_subscapula.value)+parseFloat(form.skinfold_suprailiac.value)
	return 1.112-0.00043499*sum+0.00000055*Math.pow(sum,2)-0.00028826*form.age.value
}

function JacksonPollock7SiteFemale(form){
	var sum = parseFloat(form.skinfold_pectoral.value)+parseFloat(form.skinfold_abdomen.value)+parseFloat(form.skinfold_quadriceps.value)+parseFloat(form.skinfold_triceps.value)+parseFloat(form.skinfold_midaxilla.value)+parseFloat(form.skinfold_subscapula.value)+parseFloat(form.skinfold_suprailiac.value)
	return 1.097-0.00046971*sum+0.00000056*Math.pow(sum,2)-0.00012828*form.age.value
}

function JacksonPollockHarpendenCorrection3SiteMale(percent_fat){
	return 0.5945+1.0706*percent_fat
}

function JacksonPollockHarpendenCorrection3SiteFemale(percent_fat){
	return 2.2503+0.9823*percent_fat
}

function JacksonPollockHarpendenCorrection7SiteMale(percent_fat){
	return 0.6181+1.0664*percent_fat
}

function JacksonPollockHarpendenCorrection7SiteFemale(percent_fat){
	return 1.0203+1.0230*percent_fat
}

function calc(form){
	var N_sites = form.N_sites.options[form.N_sites.selectedIndex].value
	var gender = form.gender.options[form.gender.selectedIndex].value
	var lange_calipers = form.lange_calipers.checked
	if(gender=="gender_male"){
		if(N_sites=="3"){
			var density = JacksonPollock3SiteMale(form)
		}
		else{
			var density = JacksonPollock7SiteMale(form)
		}
	}
	else{
		if(N_sites=="3"){
			var density = JacksonPollock3SiteFemale(form)
		}
		else{
			var density = JacksonPollock7SiteFemale(form)
		}
	}
	var percent_fat = ((4.95/density-4.5)*100) //Siri equation
	var lean_weight = parseFloat(form.weight.value)*(1-percent_fat/100)
	if(!lange_calipers){
		if(gender=="gender_male"){
			if(N_sites=="3"){
				percent_fat = JacksonPollockHarpendenCorrection3SiteMale(percent_fat)
			}
			else{
				percent_fat = JacksonPollockHarpendenCorrection7SiteMale(percent_fat)
			}
		}
		else{
			if(N_sites=="3"){
				percent_fat = JacksonPollockHarpendenCorrection3SiteFemale(percent_fat)
			}
			else{
				percent_fat = JacksonPollockHarpendenCorrection7SiteFemale(percent_fat)
			}
		}
	}
	form.percent_fat.value = percent_fat.toFixed(2)
	form.lean_weight.value = lean_weight.toFixed(2)
}