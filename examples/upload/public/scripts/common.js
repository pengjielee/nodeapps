function uploadFiles(files, fileList, fileProgress) {
  if (files.length <= 0) {
    alert('请至少选择一个文件');
    return;
  }

  var formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i]);
  }
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var html = [];
      if (response.status === 1) {
        response.data.forEach(function (item, index) {
          html.push(`
            <div>
              <a href="${item.src}" target="_blank">${item.name}</a>
            </div>
          `);
        });
        fileList.innerHTML = html.join('');
      } else {
        alert(response.message);
      }
    }
  };
  xhr.upload.addEventListener('progress', function (e) {
    if (e.lengthComputable) {
      var precent = Math.floor((e.loaded / e.total) * 100);
      fileProgress.style.display = 'block';
      fileProgress.value = precent;
      fileProgress.innerHTML = precent + '%';
    } else {
      console.log('unable to compute progress information');
    }
  });
  xhr.open('POST', '/api/upload');
  xhr.send(formData);
}
