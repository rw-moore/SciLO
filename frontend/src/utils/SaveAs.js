export default function download(content, fileName, contentType) {
	let a = document.createElement('a');
	let file = new Blob([JSON.stringify(content, null, 2)], {
		type: contentType,
	});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

// download(jsonData, 'json.txt', 'text/plain');
