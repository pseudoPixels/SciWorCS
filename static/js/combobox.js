// JavaScript Document

function addcombo(){
	var combo = document.getElementById(combo);
	var option = document.createElement("option");
	
	$.ajax({
		type:POST,
		url:"/combo.py",
		success: callbackFunc});
}

function callbackFunc(response){
	obj=JSON.stringfy(response) 
}

