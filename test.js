var barcode = '798';
var barcodelength = 9;
var str = '';
console.log(barcode.length);

if(barcode.length < barcodelength){
	str = new Array(barcodelength - barcode.length).join( '0' ) + barcode;
} 

console.log(str);
